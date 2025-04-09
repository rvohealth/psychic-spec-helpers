import { WaitForSelectorOptions } from 'puppeteer'

export default async function clickButton(expectedText: string, opts?: WaitForSelectorOptions) {
  await expect(page).toClickButton(expectedText, opts)
}
