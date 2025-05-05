import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'

export default async function toClickButton(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  try {
    const el = await page.waitForSelector(
      `button::-p-text("${expectedText}")`,
      applyDefaultWaitForOpts(opts)
    )
    await el!.click()

    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toClickLink')
      },
    }
  } catch {
    return {
      pass: false,
      message: () => `Expected page to have clickable link with matching text: "${expectedText}"`,
    }
  }
}
