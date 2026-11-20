import { ElementHandle, Page, WaitForSelectorOptions } from 'puppeteer'
import sleep from '../../shared/sleep.js'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'

export type ClickOutcome = { clicked: true } | { clicked: false; cause: string }

/**
 * Finds the element to click. timeLeft is undefined on the first attempt,
 * which waits as the matcher always has; on a retry it is the time left, in
 * Puppeteer's convention (0 is no limit). null means no element to click.
 */
export type ClickTargetFinder = (timeLeft: number | undefined) => Promise<ElementHandle | null>

// Puppeteer's Locator waits this long between attempts.
const retryDelay = 100

/**
 * Find an element and click it once, as ElementHandle#click does: scroll it
 * into view if it is not wholly in the viewport, take the middle of its first
 * client rect within the viewport, and click there with the page's mouse.
 *
 * When a step before the mouse click throws (the element never appeared, was
 * replaced by a re-render, or has no point to click yet, such as a control in
 * a panel still sliding in from off-screen), find the element again and retry
 * until the timeout (ms; Infinity for no limit) or the signal aborts. A mouse
 * click that was sent is never retried, even when it rejects, so its effect on
 * the page happens at most once. A click that succeeds on the first attempt
 * does exactly what it did before retries existed.
 *
 * The outcome holds the last error's message when nothing was clicked.
 */
export async function clickBeforeTimeout(
  find: ClickTargetFinder,
  { timeout, signal }: { timeout: number; signal?: AbortSignal | undefined }
): Promise<ClickOutcome> {
  const deadline = Date.now() + timeout
  let firstAttempt = true

  for (;;) {
    const timeLeft = firstAttempt
      ? undefined
      : timeout === Infinity
        ? 0
        : Math.max(1, deadline - Date.now())
    firstAttempt = false

    const aimed = await aim(find, timeLeft)
    if ('cause' in aimed) {
      // A retry gets at least retryDelay to find the element again, so that
      // the last failure reported is a real one, not a find cut short.
      if (deadline - Date.now() <= 2 * retryDelay || signal?.aborted) {
        return { clicked: false, cause: aimed.cause }
      }
      await sleep(retryDelay)
      continue
    }

    const { element, point } = aimed
    try {
      await element.frame.page().mouse.click(point.x, point.y)
      return { clicked: true }
    } catch (error) {
      return { clicked: false, cause: messageOf(error) }
    } finally {
      await disposeQuietly(element)
    }
  }
}

/**
 * Every step of ElementHandle#click before the mouse click: find the element,
 * scroll it into view unless it is wholly in the viewport, and take its
 * clickable point. Nothing here clicks, so any of it can be retried.
 */
async function aim(
  find: ClickTargetFinder,
  timeLeft: number | undefined
): Promise<{ element: ElementHandle; point: { x: number; y: number } } | { cause: string }> {
  let element: ElementHandle | null = null
  try {
    element = await find(timeLeft)
    if (!element) return { cause: 'No element to click was found' }
    if (!(await element.isIntersectingViewport({ threshold: 1 }))) await element.scrollIntoView()
    return { element, point: await element.clickablePoint() }
  } catch (error) {
    await disposeQuietly(element)
    return { cause: messageOf(error) }
  }
}

/**
 * The four click matchers' target: page.waitForSelector(selector) with the
 * caller's WaitForSelectorOptions, as they have always used it, and the
 * timeout those options give (5000ms by default; an explicit undefined is the
 * page's default timeout, and 0 no limit, as in waitForSelector).
 */
export function clickSelectorBeforeTimeout(
  page: Page,
  selector: string,
  opts?: WaitForSelectorOptions
): Promise<ClickOutcome> {
  const waitOpts = applyDefaultWaitForOpts(opts)
  const timeout = waitOpts.timeout === undefined ? page.getDefaultTimeout() : waitOpts.timeout

  return clickBeforeTimeout(
    async timeLeft =>
      await page.waitForSelector(
        selector,
        timeLeft === undefined ? waitOpts : { ...waitOpts, timeout: timeLeft }
      ),
    { timeout: timeout === 0 ? Infinity : timeout, signal: waitOpts.signal }
  )
}

/**
 * The failure the four click matchers report: what was being clicked, and
 * why Puppeteer could not click it.
 */
export function clickFailure(expectation: string, outcome: { cause: string }) {
  return {
    pass: false,
    message: () => `${expectation}. ${outcome.cause}`,
  }
}

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

async function disposeQuietly(element: ElementHandle | null) {
  try {
    await element?.dispose()
  } catch {
    // The page navigated away; nothing is left to release.
  }
}
