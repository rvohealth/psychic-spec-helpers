import { Page, WaitForSelectorOptions } from 'puppeteer'
import { clickFailure, clickSelectorBeforeTimeout } from '../internal/clickBeforeTimeout.js'

/**
 * Click the first element matching cssSelector, once it appears. When it cannot be clicked
 * yet (it was replaced by a re-render, or has no point on screen, like a
 * control in a panel still sliding in), it is found again and the click
 * retried until the timeout; a click that reached the page is never retried.
 * See clickBeforeTimeout.
 */
export default async function toClickSelector(
  page: Page,
  cssSelector: string,
  opts?: WaitForSelectorOptions
) {
  const outcome = await clickSelectorBeforeTimeout(page, cssSelector, opts)
  if (!outcome.clicked) {
    return clickFailure(
      `Expected page to have clickable element with matching selector: "${cssSelector}"`,
      outcome
    )
  }

  return {
    pass: true,
    message: () => {
      throw new Error('Cannot negate toClickSelector')
    },
  }
}
