import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import getFieldValue, {
  describeFieldValue,
  fieldValueMatches,
  FieldValueState,
  missingField,
} from '../internal/getFieldValue.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export type ValueMatcherExpected = string | RegExp
export type ValueMatcherOpts = { timeout?: number }

/**
 * Assert that the first input, textarea or select matching cssSelector that a
 * user can see holds a value equal to expected (a string) or matching it (a
 * RegExp). It reads the field's value property, so it sees what was typed or
 * set by a script even when the value attribute was never updated. A missing
 * or hidden field fails. Retries until the timeout. toNotHaveValue is the
 * complementary assertion.
 */
export default async function toHaveValue(
  argumentPassedToExpect: Page,
  cssSelector: string,
  expected: ValueMatcherExpected,
  opts: ValueMatcherOpts = {}
) {
  return await evaluateWithRetryAndTimeout(
    argumentPassedToExpect,
    async () => {
      requirePuppeteerPage(argumentPassedToExpect, 'toHaveValue')

      const state = await getFieldValue(argumentPassedToExpect, cssSelector)
      return {
        pass: state.found && fieldValueMatches(state.value, expected),
        actual: state,
      }
    },
    {
      successText: () => {
        throw new Error('Cannot negate toHaveValue, use toNotHaveValue instead')
      },
      failureText: (state: FieldValueState) =>
        missingField(state, cssSelector) ??
        `Expected "${cssSelector}" to have value ${describeFieldValue(expected)}, but its value is: ${
          state.found ? describeFieldValue(state.value) : ''
        }`,
      timeout: opts.timeout,
    }
  )
}
