import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'

export default async function toNotHaveSelector(
  page: Page,
  selector: string,
  opts?: WaitForSelectorOptions
) {
  try {
    await page.waitForSelector(selector, { hidden: true, ...applyDefaultWaitForOpts(opts) })
    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toNotHaveSelector, use toHaveSelector instead')
      },
    }
  } catch {
    return {
      pass: false,
      message: () => `Expected page to not have visible selector, but it did: ${selector}`,
    }
  }
}
