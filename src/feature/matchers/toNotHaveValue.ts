import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import getFieldValue, {
  describeFieldValue,
  fieldValueMatches,
  FieldValueState,
  missingField,
} from '../internal/getFieldValue.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'
import type { ValueMatcherExpected, ValueMatcherOpts } from './toHaveValue.js'

/**
 * Assert that the first input, textarea or select matching cssSelector that a
 * user can see holds a value that is not equal to unexpected (a string) and
 * does not match it (a RegExp). A missing or hidden field fails, so a typo
 * in the selector cannot pass. Retries until the timeout.
 */
export default async function toNotHaveValue(
  argumentPassedToExpect: Page,
  cssSelector: string,
  unexpected: ValueMatcherExpected,
  opts: ValueMatcherOpts = {}
) {
  return await evaluateWithRetryAndTimeout(
    argumentPassedToExpect,
    async () => {
      requirePuppeteerPage(argumentPassedToExpect)

      const state = await getFieldValue(argumentPassedToExpect, cssSelector)
      return {
        pass: state.found && !fieldValueMatches(state.value, unexpected),
        actual: state,
      }
    },
    {
      successText: () => {
        throw new Error('Cannot negate toNotHaveValue, use toHaveValue instead')
      },
      failureText: (state: FieldValueState) =>
        missingField(state, cssSelector) ??
        `Expected "${cssSelector}" not to have value ${describeFieldValue(unexpected)}, but its value is: ${
          state.found ? describeFieldValue(state.value) : ''
        }`,
      timeout: opts.timeout,
    }
  )
}
