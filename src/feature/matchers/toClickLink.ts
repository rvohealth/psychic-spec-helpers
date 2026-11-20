import { Page, WaitForSelectorOptions } from 'puppeteer'
import { clickFailure, clickSelectorBeforeTimeout } from '../internal/clickBeforeTimeout.js'
import { actionPassed } from '../internal/actionMatcher.js'

/**
 * Click the innermost element inside a link whose text
 * contains expectedText, once it appears. When it cannot be clicked
 * yet (it was replaced by a re-render, or has no point on screen, like a
 * control in a panel still sliding in), it is found again and the click
 * retried until the timeout; a click that reached the page is never retried.
 * See clickBeforeTimeout.
 */
export default async function toClickLink(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  const outcome = await clickSelectorBeforeTimeout(page, `a ::-p-text(${expectedText})`, opts)
  if (!outcome.clicked) {
    return clickFailure(
      `Expected page to have clickable link with matching text: "${expectedText}"`,
      outcome
    )
  }

  return actionPassed()
}
