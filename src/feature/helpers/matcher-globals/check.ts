import { WaitForSelectorOptions } from 'puppeteer'

export default async function check(expectedText: string, opts?: WaitForSelectorOptions) {
  await expect(page).toCheck(expectedText, opts)
}
