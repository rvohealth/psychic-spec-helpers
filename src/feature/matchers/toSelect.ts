import { Page, WaitForSelectorOptions } from 'puppeteer'

export default async function toSelect(
  page: Page,
  cssSelector: string,
  optionText: string,
  opts?: WaitForSelectorOptions
) {
  try {
    const el = await page.waitForSelector(cssSelector, { timeout: 5000, ...opts })

    if (!el)
      return {
        pass: false,
        message: () =>
          `Expected page to have a select element matching the css selector "${cssSelector}", but it could not be found`,
      }

    await el.select(optionText)

    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toSelect')
      },
    }
  } catch {
    return {
      pass: false,
      message: () =>
        `the "${cssSelector}" was found, but it did not have the option: "${optionText}"`,
    }
  }
}
