import { Page, WaitForSelectorOptions } from 'puppeteer'

export default async function toUncheck(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  try {
    const labelSelector = `label::-p-text("${expectedText}")`

    const forAttributeValue = await page.$eval(labelSelector, label => label.getAttribute('for'))
    const inputElement = await page.waitForSelector(`#${forAttributeValue}`, opts)
    const isChecked = await page.evaluate(checkbox => checkbox.checked, inputElement)
    if (!isChecked)
      return {
        pass: false,
        message: () => `A checkbox was found with "${expectedText}", but it is already unchecked`,
      }

    await expect(page).toHaveSelector(`#${forAttributeValue}:checked`)
    await expect(page).toClickSelector(labelSelector)
    await expect(page).toNotHaveSelector(`#${forAttributeValue}:checked`)

    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toUncheck, try toCheck')
      },
    }
  } catch (error) {
    return {
      pass: false,
      message: () => `Expected page to have checkable element with text: "${expectedText}"`,
    }
  }
}
