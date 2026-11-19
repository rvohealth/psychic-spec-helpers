import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'
import {
  checkableActionFailure,
  checkableLabelSelector,
  findCheckableTarget,
} from '../internal/checkableControl.js'

/**
 * Check the checkbox, radio or switch the text names. A control that is
 * already checked is left alone; otherwise it is clicked once: through its
 * label when today's label lookup found it, as always, or directly when the
 * fallback found it. See findCheckableTarget for how the text finds the
 * control.
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
        if (target.tier === 'label') {
          await expect(page).toClickSelector(
            checkableLabelSelector(expectedText),
            applyDefaultWaitForOpts(opts)
          )
        } else {
          await target.control.click()
        }
      }
    } finally {
      await target.control?.dispose()
    }

    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toCheck')
      },
    }
  } catch {
    return {
      pass: false,
      message: () => `Expected page to have checkable element with text: "${expectedText}"`,
    }
  }
}
