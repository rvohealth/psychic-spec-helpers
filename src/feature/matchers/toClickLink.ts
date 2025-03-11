import { Page, WaitForSelectorOptions } from 'puppeteer'

export default async function toClickLink(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  try {
    const el = await page.waitForSelector(`a ::-p-text(${expectedText})`, opts)
    await el!.click()

    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toClickLink')
      },
    }
  } catch (error) {
    return {
      pass: false,
      message: `Expected page to have clickable link with matching text: "${expectedText}"`,
    }
  }
}
