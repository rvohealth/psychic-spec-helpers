import { Page } from 'puppeteer'

async function bestEffort(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn()
  } catch (err) {
    // Per-spec teardown must never throw: a failure cleaning one spec's state
    // would fail an unrelated spec's `afterEach`. Swallow and move on.
    void err
  }
}

/**
 * Per-spec browser cleanup for feature specs that share a single browser
 * across spec files. Call in `afterEach` so every spec starts from a clean
 * slate and so server-side resources are released between specs.
 *
 * Three best-effort steps, in this order:
 *
 *  1. Clear `localStorage` / `sessionStorage` for the current origin (auth
 *     tokens, app state). Done first, while the page is still on the app
 *     origin — storage is inaccessible once we navigate to `about:blank`.
 *  2. Clear cookies for the page's browser context (context-scoped so
 *     parallel contexts stay isolated).
 *  3. Navigate to `about:blank`. Besides the clean slate, this cancels any
 *     still-in-flight requests, releasing server-side resources they held
 *     (e.g. a pooled database client) so server teardown isn't blocked.
 *
 * The shared browser is intentionally left open and reusable. Operates on
 * the global `page`; a no-op if there is no open page.
 */
export default async function resetBrowserState(): Promise<void> {
  const page = (globalThis as { page?: Page }).page
  if (!page || page.isClosed()) return

  if (/^https?:/.test(page.url())) {
    await bestEffort(() =>
      page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
        // `document` isn't in the Node lib this package is type-checked
        // against (localStorage/sessionStorage are), so reach it through a
        // typed globalThis cast — it exists at runtime in the browser.
        const { document } = globalThis as unknown as { document: { cookie: string } }
        // Expire every JS-visible cookie on this origin. The browser-context
        // cookie API below covers HttpOnly cookies, but does not reliably
        // surface document.cookie-set cookies across every Puppeteer browser
        // backend (notably Firefox/WebDriver-BiDi), so sweep here too.
        for (const entry of document.cookie.split(';')) {
          const eq = entry.indexOf('=')
          const name = (eq > -1 ? entry.slice(0, eq) : entry).trim()
          if (name) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        }
      })
    )
  }

  // Catches HttpOnly cookies (and any the JS sweep above could not reach).
  await bestEffort(async () => {
    const context = page.browserContext()
    const cookies = await context.cookies()
    if (cookies.length) await context.deleteCookie(...cookies)
  })

  await bestEffort(() => page.goto('about:blank'))
}
