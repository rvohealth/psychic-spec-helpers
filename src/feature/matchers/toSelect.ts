import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'
import { actionPassed } from '../internal/actionMatcher.js'
import { messageOf } from '../internal/clickBeforeTimeout.js'

/**
 * Select the option whose value is optionValue in the select matching
 * cssSelector, as a user choosing it would (change and input events fire).
 * This matches the option's value attribute, not its label, so a spec can pass
 * an enum value rather than its translated display text. If no option has that
 * value, nothing fails: every option is deselected, and a single-choice select
 * falls back to its first option. Confirm the result with toHaveSelected.
 */
export default async function toSelect(
  page: Page,
  cssSelector: string,
  optionValue: string,
  opts?: WaitForSelectorOptions
) {
  try {
    const el = await page.waitForSelector(cssSelector, {
      timeout: 5000,
      ...applyDefaultWaitForOpts(opts),
    })

    if (!el)
      return {
        pass: false,
        message: () =>
          `Expected page to have a select element matching the css selector "${cssSelector}", but it could not be found`,
      }

    await el.select(optionValue)

    return actionPassed()
  } catch (error) {
    // A timeout, an element that is not a select, or an aborted signal: a
    // missing option never throws (see above).
    const cause = messageOf(error)
    return {
      pass: false,
      message: () =>
        `Expected page to have a select element matching the css selector "${cssSelector}". ${cause}`,
    }
  }
}
