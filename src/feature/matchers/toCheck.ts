import { Page, WaitForSelectorOptions } from 'puppeteer'
import { actionPassed } from '../internal/actionMatcher.js'
import {
  checkableActionFailure,
  checkableExpectation,
  clickCheckableTarget,
  findCheckableTarget,
} from '../internal/checkableControl.js'

/**
 * Check the checkbox, radio or switch the text names. A control that is
 * already checked is left alone; otherwise it is clicked once: through its
 * label when today's label lookup found it, as always, or directly when the
 * fallback found it. See findCheckableTarget for how the text finds the
 * control.
 *
 * A click that cannot reach the control yet is retried until the timeout, but
 * a click that reached the page never is; see clickBeforeTimeout.
 */
export default async function toCheck(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
): Promise<{ pass: boolean; message: () => string }> {
  try {
    const found = await findCheckableTarget(page, expectedText, opts)
    if ('failure' in found) return checkableActionFailure(found.failure, expectedText)

    const { target } = found
    try {
      if (target.reading?.state !== 'checked') {
        const { outcome } = await clickCheckableTarget(page, expectedText, target, opts, false)
        if (!outcome.clicked) {
          return {
            pass: false,
            message: () => `${checkableExpectation(expectedText)}. ${outcome.cause}`,
          }
        }
      }
    } finally {
      await target.control?.dispose()
    }

    return actionPassed()
  } catch {
    return { pass: false, message: () => checkableExpectation(expectedText) }
  }
}
