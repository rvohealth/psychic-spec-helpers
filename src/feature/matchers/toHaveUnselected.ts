import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import getSelectState, { missingSelectOrOption, SelectState } from '../internal/getSelectState.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'
import type { SelectMatcherOpts } from './toHaveSelected.js'

/**
 * Assert that the select matching cssSelector has an option whose value is
 * optionValue and that it is not selected. A missing select or option fails,
 * so a typo cannot pass. Like toSelect, this matches the option's value
 * attribute, not its label.
 */
export default async function toHaveUnselected(
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
        pass:
          state.found &&
          state.optionValues.includes(optionValue) &&
          !state.selectedValues.includes(optionValue),
        actual: state,
      }
    },
    {
      successText: () => {
        throw new Error('Cannot negate toHaveUnselected, use toHaveSelected instead')
      },
      failureText: (state: SelectState) =>
        missingSelectOrOption(state, cssSelector, optionValue) ??
        `Expected "${optionValue}" not to be selected in the "${cssSelector}" select, but it is`,
      timeout: opts.timeout,
    }
  )
}
