import { WaitForSelectorOptions } from 'puppeteer'

export default async function uncheck(expectedText: string, opts?: WaitForSelectorOptions) {
  await expect(page).toUncheck(expectedText, opts)
}
