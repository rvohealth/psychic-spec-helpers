import { Page, WaitForSelectorOptions } from 'puppeteer'
import {
  CheckableObservation,
  retryCheckableState,
  unresolvedCheckableControl,
} from '../internal/checkableControl.js'

/**
 * Assert that the checkbox, radio or switch the text names is checked,
 * retrying until the timeout (5000ms by default) or until the signal aborts.
 * See checkableControlReader for how the text finds the control and
 * checkableControl for how its state is read.
 */
export default async function toHaveChecked(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
): Promise<{ pass: boolean; message: () => string }> {
  return await retryCheckableState(page, expectedText, opts, 'checked', {
    successText: () => {
      throw new Error('cannot negate toHaveChecked, try toHaveUnchecked')
    },
    failureText: (observation: CheckableObservation) =>
      observation.resolved
        ? `Found element with text: ${expectedText} (${observation.control}), but it was not checked: it is ${observation.state}`
        : `Expected page to have checked checkbox with text: "${expectedText}". ${unresolvedCheckableControl(observation, expectedText)}`,
    abortedText: () => `Expected page to have checked checkbox with text: "${expectedText}"`,
  })
}
