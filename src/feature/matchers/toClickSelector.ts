import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'

export default async function toClickSelector(
  page: Page,
  cssSelector: string,
  opts?: WaitForSelectorOptions
) {
  try {
    const el = await page.waitForSelector(cssSelector, applyDefaultWaitForOpts(opts))
    await el!.click()

    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toNotMatchTextContent, use toMatchTextContent instead')
      },
    }
  } catch {
    return {
      pass: false,
      message: () =>
        `Expected page to have clickable element with matching selector: "${cssSelector}"`,
    }
  }
}
