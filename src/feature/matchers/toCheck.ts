import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'
import {
  checkableActionFailure,
  checkableLabelSelector,
  clickFallbackControl,
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
    // Why the click failed, when it did.
    let clickCause: string | undefined
    try {
      if (target.reading?.state !== 'checked') {
        if (target.tier === 'label') {
          try {
            await expect(page).toClickSelector(
              checkableLabelSelector(expectedText),
              applyDefaultWaitForOpts(opts)
            )
          } catch (error) {
            clickCause = error instanceof Error ? error.message : String(error)
          }
        } else {
          const outcome = await clickFallbackControl(page, expectedText, target.control, opts)
          if (!outcome.clicked) clickCause = outcome.cause
        }
      }
    } finally {
      await target.control?.dispose()
    }

    if (clickCause !== undefined) {
      return {
        pass: false,
        message: () =>
          `Expected page to have checkable element with text: "${expectedText}". ${clickCause}`,
      }
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
