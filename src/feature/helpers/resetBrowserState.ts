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

// How long the page must go without a request in flight to count as idle.
// Every reset pays this once, even when nothing is in flight; a request the
// page starts within it (e.g. one chained off the previous response) is
// waited for too.
const IDLE_WINDOW_MS = 100

// The longest the reset waits for in-flight requests before carrying on
// anyway. Kept well under vitest's default 10 s hook timeout.
const IN_FLIGHT_LIMIT_MS = 2000

/**
 * Per-spec browser cleanup for feature specs that share a single browser
 * across spec files. Call in `afterEach` so every spec starts from a clean
 * slate.
 *
 * Four best-effort steps, in this order:
 *
 *  1. Wait for the page's in-flight requests to receive their responses, up
 *     to a limit of 2 seconds (a page with nothing in flight waits only a
 *     100 ms idle window). A spec often ends right after an action whose
 *     request it never waited for; when the request's handler writes to the
 *     database before responding, waiting here keeps that write from landing
 *     in the next spec. This waits for each response's headers, not for the
 *     server to finish: work a handler does after responding (a background
 *     job, a promise it doesn't await) is not covered. A request that holds
 *     its response open (socket.io long-polling before its websocket
 *     upgrade) costs the full limit. Hitting the limit does not fail the
 *     spec.
 *  2. Clear `localStorage` / `sessionStorage` for the current origin (auth
 *     tokens, app state). Done while the page is still on the app origin —
 *     storage is inaccessible once we navigate to `about:blank`.
 *  3. Clear cookies for the page's browser context (context-scoped so
 *     parallel contexts stay isolated). Runs after step 1 so a cookie set by
 *     a response that was still in flight is cleared too.
 *  4. Navigate to `about:blank`, which aborts any request still in flight
 *     in the browser. Aborting does not stop the server: a handler for an
 *     aborted request keeps running.
 *
 * The shared browser is intentionally left open and reusable. Operates on
 * the global `page`; a no-op if there is no open page.
 */
export default async function resetBrowserState(): Promise<void> {
  const page = (globalThis as { page?: Page }).page
  if (!page || page.isClosed()) return

  // Must come before anything that navigates: an aborted request counts as
  // finished, so waiting after the navigation would return at once.
  await bestEffort(() =>
    page.waitForNetworkIdle({ idleTime: IDLE_WINDOW_MS, timeout: IN_FLIGHT_LIMIT_MS })
  )

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
