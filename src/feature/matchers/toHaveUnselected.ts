import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import getSelectState, { missingSelectOrOption, SelectState } from '../internal/getSelectState.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'
import type { SelectMatcherOpts } from './toHaveSelected.js'

/**
 * Assert that the select matching cssSelector has an option labeled
 * optionLabel and that it is not selected. A missing select or option fails,
 * so a typo cannot pass. The label is what the user sees in the menu, not the
 * option's value.
 */
export default async function toHaveUnselected(
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
        pass:
          state.found &&
          state.optionLabels.includes(optionLabel) &&
          !state.selectedLabels.includes(optionLabel),
        actual: state,
      }
    },
    {
      successText: () => {
        throw new Error('Cannot negate toHaveUnselected, use toHaveSelected instead')
      },
      failureText: (state: SelectState) =>
        missingSelectOrOption(state, cssSelector, optionLabel) ??
        `Expected "${optionLabel}" not to be selected in the "${cssSelector}" select, but it is`,
      timeout: opts.timeout,
    }
  )
}
