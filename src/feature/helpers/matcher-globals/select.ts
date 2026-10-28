import { WaitForSelectorOptions } from 'puppeteer'

/**
 * Select the option whose value attribute (not its label) is optionValue; see
 * toSelect.
 */
export default async function select(
  cssSelector: string,
  optionValue: string,
  opts?: WaitForSelectorOptions
) {
  await expect(page).toSelect(cssSelector, optionValue, opts)
}
