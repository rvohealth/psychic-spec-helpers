import { Page, WaitForSelectorOptions } from 'puppeteer'

export default async function toCheck(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  const failure = {
    pass: false,
    message: () => `Expected page to have checkable element with text: "${expectedText}"`,
  }

  try {
    await expect(page).toClickSelector(`label::-p-text("${expectedText}")`, opts)
    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toCheck')
      },
    }
  } catch {
    return failure
  }
}
