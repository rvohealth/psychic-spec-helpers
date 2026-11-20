import { ElementHandle, Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'
import { actionPassed } from '../internal/actionMatcher.js'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import {
  checkableActionFailure,
  checkableExpectation,
  clickCheckableTarget,
  findCheckableTarget,
  readCheckableTargetAgain,
  unresolvedCheckableControl,
} from '../internal/checkableControl.js'

/**
 * Uncheck the checkbox, radio or switch the text names. A control that is
 * already unchecked is left alone; otherwise it is clicked once (through its
 * label when today's label lookup found it, as always, or directly when the
 * fallback found it), and then must become unchecked within 5000ms. See
 * findCheckableTarget for how the text finds the control.
 *
 * A click that cannot reach the control yet is retried until 5000ms have
 * passed, but a click that reached the page never is; see clickBeforeTimeout.
 */
export default async function toUncheck(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
): Promise<{ pass: boolean; message: () => string }> {
  const failure = { pass: false, message: () => checkableExpectation(expectedText) }

  try {
    const found = await findCheckableTarget(page, expectedText, opts)
    if ('failure' in found) return checkableActionFailure(found.failure, expectedText)

    const { target } = found
    // The element the click reached, when the fallback found the control.
    let clicked: ElementHandle | null = null
    try {
      // { hidden: true } accepts an absent control, which has never been
      // uncheckable.
      if (!target.reading) return failure
      if (target.reading.state === 'unchecked') return actionPassed()

      // As before, the label or the control is clicked without the caller's
      // options, with the default timeout.
      const result = await clickCheckableTarget(page, expectedText, target, undefined, true)
      const { outcome } = result
      if (!outcome.clicked) {
        return {
          pass: false,
          message: () => `${checkableExpectation(expectedText)}. ${outcome.cause}`,
        }
      }
      clicked = result.clicked
    } finally {
      await target.control?.dispose()
    }

    // As before, the control must then be unchecked within the default
    // timeout, whatever opts says; a control that is gone counts as unchecked.
    let unchecked: { pass: boolean; message: () => string }
    try {
      unchecked = await evaluateWithRetryAndTimeout(
        page,
        async () => {
          const after = await readCheckableTargetAgain(page, expectedText, target, clicked)
          return {
            pass:
              after === null ||
              (after !== undefined && 'state' in after && after.state === 'unchecked'),
            actual: after,
          }
        },
        {
          failureText: (after: Awaited<ReturnType<typeof readCheckableTargetAgain>>) => {
            const clickedText = `Clicked the checkable element with text: "${expectedText}"`
            if (after && 'reason' in after) {
              return `${clickedText}, but it left the page. ${unresolvedCheckableControl(after, expectedText)}`
            }
            // undefined: no read succeeded (see readCheckableTargetAgain).
            if (!after) return `${clickedText}, but its state could not be read after the click`
            return `${clickedText} (${after.control}), but it is still ${after.state}`
          },
          timeout: applyDefaultWaitForOpts().timeout,
        }
      )
    } finally {
      await clicked?.dispose()
    }
    if (!unchecked.pass) return { pass: false, message: unchecked.message }

    return actionPassed()
  } catch {
    return failure
  }
}
