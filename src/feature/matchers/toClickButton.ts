import { Page, WaitForSelectorOptions } from 'puppeteer'
import { clickFailure, clickSelectorBeforeTimeout } from '../internal/clickBeforeTimeout.js'

/**
 * Click the innermost element inside a button whose
 * text contains expectedText, once it appears. When it cannot be clicked
 * yet (it was replaced by a re-render, or has no point on screen, like a
 * control in a panel still sliding in), it is found again and the click
 * retried until the timeout; a click that reached the page is never retried.
 * See clickBeforeTimeout.
 */
export default async function toClickButton(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  const outcome = await clickSelectorBeforeTimeout(page, `button::-p-text("${expectedText}")`, opts)
  if (!outcome.clicked) {
    return clickFailure(
      `Expected page to have clickable button with matching text: "${expectedText}"`,
      outcome
    )
  }

  return {
    pass: true,
    message: () => {
      throw new Error('Cannot negate toClickButton')
    },
  }
}
