import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'

export default async function toClick(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  try {
    const el = await page.waitForSelector(
      `*::-p-text(${expectedText})`,
      applyDefaultWaitForOpts(opts)
    )
    await el!.click()

    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toClick')
      },
    }
  } catch {
    return {
      pass: false,
      message: () => `Expected page to have clickable element with text: "${expectedText}"`,
    }
  }
}
