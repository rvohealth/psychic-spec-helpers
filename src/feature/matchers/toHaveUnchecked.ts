import { Page, WaitForSelectorOptions } from 'puppeteer'

export default async function toHaveUnchecked(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  try {
    const checkbox = await page.waitForSelector(
      `input[type="checkbox"][value="${expectedText}"]`,
      opts
    )
    const isChecked = await page.evaluate(checkbox => checkbox.checked, checkbox)

    return {
      pass: !isChecked,
      message: () => {
        throw new Error('cannot negate toHaveUnchecked, try toHaveChecked')
      },
    }
  } catch {
    return {
      pass: false,
      message: () => `Expected page not to have checked checkbox with text: "${expectedText}"`,
    }
  }
}
