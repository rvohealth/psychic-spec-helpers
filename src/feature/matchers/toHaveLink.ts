import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'

export default async function toHaveLink(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  try {
    await page.waitForSelector(`a ::-p-text(${expectedText})`, applyDefaultWaitForOpts(opts))
    return {
      pass: true,
      message: () => {
        throw new Error('cannot negate toFill')
      },
    }
  } catch {
    return {
      pass: false,
      message: () => `Expected page not to have checked checkbox with text: "${expectedText}"`,
    }
  }
}
