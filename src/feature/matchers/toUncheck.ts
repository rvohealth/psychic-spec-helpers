import { Page, WaitForSelectorOptions } from 'puppeteer'

export default async function toUncheck(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  try {
    const el = await page.waitForSelector(`label::-p-text(${expectedText}`, opts)
    await el!.click()

    const isChecked = await page.evaluate(checkbox => checkbox.checked, el)
    if (!isChecked)
      return {
        pass: false,
        message: () => `A checkbox was found with "${expectedText}", but it is already unchecked`,
      }

    await el!.click()
    const isUncheckedNow = await page.evaluate(checkbox => checkbox.checked, el)

    return {
      pass: isUncheckedNow,
      message: () => {
        throw new Error('Cannot negate toUncheck, try toCheck')
      },
    }
  } catch (error) {
    return {
      pass: false,
      message: `Expected page to have checkable element with text: "${expectedText}"`,
    }
  }
}
