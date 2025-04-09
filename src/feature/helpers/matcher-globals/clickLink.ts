import { WaitForSelectorOptions } from 'puppeteer'

export default async function clickLink(expectedText: string, opts?: WaitForSelectorOptions) {
  await expect(page).toClickLink(expectedText, opts)
}
