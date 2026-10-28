import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import getSelectState, { missingSelectOrOption, SelectState } from '../internal/getSelectState.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export type SelectMatcherOpts = { timeout?: number }

/**
 * Assert that the select matching cssSelector has the option whose value is
 * optionValue selected. Like toSelect, this matches the option's value
 * attribute, not its label. toHaveUnselected is the complementary assertion.
 */
export default async function toHaveSelected(
  argumentPassedToExpect: Page,
  cssSelector: string,
  optionValue: string,
  opts: SelectMatcherOpts = {}
) {
  return await evaluateWithRetryAndTimeout(
    argumentPassedToExpect,
    async () => {
      requirePuppeteerPage(argumentPassedToExpect)

      const state = await getSelectState(argumentPassedToExpect, cssSelector)
      return {
        pass: state.found && state.selectedValues.includes(optionValue),
        actual: state,
      }
    },
    {
      successText: () => {
        throw new Error('Cannot negate toHaveSelected, use toHaveUnselected instead')
      },
      failureText: (state: SelectState) =>
        missingSelectOrOption(state, cssSelector, optionValue) ??
        `Expected "${optionValue}" to be selected in the "${cssSelector}" select, but the selected value is: ${
          state.found && state.selectedValues.length
            ? state.selectedValues.map(value => `"${value}"`).join(', ')
            : 'none'
        }`,
      timeout: opts.timeout,
    }
  )
}
