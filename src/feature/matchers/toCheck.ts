import { Page, WaitForSelectorOptions } from 'puppeteer'

export default async function toCheck(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  try {
    const el = await page.waitForSelector(`label::-p-text(${expectedText}`, opts)
    await el!.click()

    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toCheck')
      },
    }
  } catch (error) {
    return {
      pass: false,
      message: `Expected page to have checkable element with text: "${expectedText}"`,
    }
  }
}
