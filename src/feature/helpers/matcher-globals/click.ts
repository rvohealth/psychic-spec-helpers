import { WaitForSelectorOptions } from 'puppeteer'

export default async function click(selector: string, opts?: WaitForSelectorOptions) {
  await expect(page).toClick(selector, opts)
}
