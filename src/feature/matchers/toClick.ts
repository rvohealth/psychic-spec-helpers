import { Page, WaitForSelectorOptions } from 'puppeteer'

export default async function toClick(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  try {
    const el = await page.waitForSelector(`*::-p-text(${expectedText})`, opts)
    await el!.click()

    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toClick')
      },
    }
  } catch (error) {
    return {
      pass: false,
      message: () => `Expected page to have clickable element with text: "${expectedText}"`,
    }
  }
}
