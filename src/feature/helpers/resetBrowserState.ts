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

// Web Storage and document.cookie exist only on an http(s) document.
function onWebOrigin(page: Page): boolean {
  return /^https?:/.test(page.url())
}

// How long the page must go without a request in flight to count as idle.
// Every reset pays this once, even when nothing is in flight; a request the
// page starts within it (e.g. one chained off the previous response) is
// waited for too.
const IDLE_WINDOW_MS = 100

// The longest the reset waits for in-flight requests before carrying on
// anyway. Kept well under vitest's default 10 s hook timeout; a reset that
// hits it takes a little over 2 s, which a shorter hook timeout fails.
const IN_FLIGHT_LIMIT_MS = 2000

// Only a WebDriver BiDi browser (Firefox) gets the network-idle wait. On a
// CDP browser (Chrome), Puppeteer never counts a request aborted by a
// navigation as finished, so after the first one every later wait would run
// to IN_FLIGHT_LIMIT_MS. `Browser.protocol` ('cdp' | 'webDriverBiDi') is set
// at runtime by every Puppeteer from the 24.15.0 peer floor on, but its type
// is marked internal, hence the cast.
function waitsForInFlightRequests(page: Page): boolean {
  const { protocol } = page.browser() as unknown as { protocol?: string }
  return protocol !== 'cdp'
}

/**
 * Per-spec browser cleanup for feature specs that share a single browser
 * across spec files. Call in `afterEach` so every spec starts from a clean
 * slate.
 *
 * Five best-effort steps, in this order. Steps 1 and 2 run only when
 * Puppeteer drives the browser over WebDriver BiDi (Firefox, the default
 * browser). On Chrome (CDP) the reset starts at step 3 and behaves as it did
 * in 3.5.0, because Puppeteer's in-flight request count on Chrome never
 * forgets a request that a navigation cancelled: after the first such
 * cancellation, every later wait would run to the full 2-second limit. So on
 * Chrome a request the spec never waited for is aborted at step 5, and a
 * database write its handler makes can still land in the next spec.
 *
 *  1. Clear `localStorage` / `sessionStorage` for the origin the page is on
 *     when the reset starts (auth tokens, app state). Done first because a
 *     navigation still in flight (a link, form or redirect to another
 *     origin) can commit during step 2, after which this origin's storage
 *     is out of reach. A request the page sends during step 2 therefore
 *     finds storage already empty (one that reads its auth token from
 *     `localStorage` goes out without it), but still carries cookies, which
 *     are left for step 4.
 *  2. Wait for the page's in-flight requests to receive their responses, up
 *     to a limit of 2 seconds (a page with nothing in flight waits only a
 *     100 ms idle window). A spec often ends right after an action whose
 *     request it never waited for; when the request's handler writes to the
 *     database before responding, waiting here keeps that write from landing
 *     in the next spec. This waits for each response's headers, not for the
 *     server to finish: work a handler does after responding (a background
 *     job, a promise it doesn't await) is not covered. A request that holds
 *     its response open (socket.io long-polling before its websocket
 *     upgrade) costs the full limit. Hitting the limit does not fail the
 *     spec on its own: the reset carries on. The whole reset can then take
 *     a little over 2 seconds, so an `afterEach` hook timeout lower than
 *     that (vitest's `hookTimeout`; the default is 10 seconds) fails the
 *     hook; raise it.
 *  3. Clear `localStorage` / `sessionStorage` (again, on Firefox) for the
 *     origin the page is on now, which catches anything a response handler
 *     wrote during step 2. Storage is inaccessible once we navigate to
 *     `about:blank`.
 *  4. Clear cookies for the page's browser context (context-scoped so
 *     parallel contexts stay isolated). Runs after step 2 so a cookie set by
 *     a response that was still in flight is cleared too.
 *  5. Navigate to `about:blank`, which aborts any request still in flight
 *     in the browser. Aborting does not stop the server: a handler for an
 *     aborted request keeps running.
 *
 * The shared browser is intentionally left open and reusable. Operates on
 * the global `page`; a no-op if there is no open page.
 */
export default async function resetBrowserState(): Promise<void> {
  const page = (globalThis as { page?: Page }).page
  if (!page || page.isClosed()) return

  if (waitsForInFlightRequests(page)) {
    // Before the wait: a navigation in flight can commit to another origin
    // during it, leaving this origin's storage behind for the next spec.
    if (onWebOrigin(page)) {
      await bestEffort(() =>
        page.evaluate(() => {
          localStorage.clear()
          sessionStorage.clear()
        })
      )
    }

    // Must come before anything that navigates: an aborted request counts as
    // finished, so waiting after the navigation would return at once.
    await bestEffort(() =>
      page.waitForNetworkIdle({ idleTime: IDLE_WINDOW_MS, timeout: IN_FLIGHT_LIMIT_MS })
    )
  }

  if (onWebOrigin(page)) {
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
