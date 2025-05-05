import { WaitForSelectorOptions } from 'puppeteer'

export default async function select(
  cssSelector: string,
  optionText: string,
  opts?: WaitForSelectorOptions
) {
  await expect(page).toSelect(cssSelector, optionText, opts)
}
