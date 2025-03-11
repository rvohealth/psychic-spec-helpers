import { Page, WaitForSelectorOptions } from 'puppeteer'

export default async function toHaveSelector(
  page: Page,
  selector: string,
  opts?: WaitForSelectorOptions
) {
  try {
    await page.waitForSelector(selector, opts)
    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toHaveSelector, use toNotHaveSelector instead')
      },
    }
  } catch {
    return {
      pass: false,
      message: () => `
expected selector: ${selector}
but no selector was found
      `,
    }
  }
}
