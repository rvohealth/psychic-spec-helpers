import { WaitForSelectorOptions } from 'puppeteer'

export default async function clickSelector(selector: string, opts?: WaitForSelectorOptions) {
  await expect(page).toClickSelector(selector, opts)
}
