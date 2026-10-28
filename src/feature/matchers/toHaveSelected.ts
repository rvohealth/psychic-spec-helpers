import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import getSelectState, { missingSelectOrOption, SelectState } from '../internal/getSelectState.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export type SelectMatcherOpts = { timeout?: number }

/**
 * Assert that the select matching cssSelector has the option labeled
 * optionLabel selected. The label is what the user sees in the menu, not the
 * option's value. toHaveUnselected is the complementary assertion.
 */
export default async function toHaveSelected(
  argumentPassedToExpect: Page,
  cssSelector: string,
  optionLabel: string,
  opts: SelectMatcherOpts = {}
) {
  return await evaluateWithRetryAndTimeout(
    argumentPassedToExpect,
    async () => {
      requirePuppeteerPage(argumentPassedToExpect)

      const state = await getSelectState(argumentPassedToExpect, cssSelector)
      return {
        pass: state.found && state.selectedLabels.includes(optionLabel),
        actual: state,
      }
    },
    {
      successText: () => {
        throw new Error('Cannot negate toHaveSelected, use toHaveUnselected instead')
      },
      failureText: (state: SelectState) =>
        missingSelectOrOption(state, cssSelector, optionLabel) ??
        `Expected "${optionLabel}" to be selected in the "${cssSelector}" select, but the selected option is: ${
          state.found && state.selectedLabels.length
            ? state.selectedLabels.map(label => `"${label}"`).join(', ')
            : 'none'
        }`,
      timeout: opts.timeout,
    }
  )
}
