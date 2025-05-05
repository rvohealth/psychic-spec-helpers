import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'

export default async function toHaveChecked(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  try {
    const labelSelector = `label::-p-text("${expectedText}")`

    // eslint-disable-next-line
    const forAttributeValue = await page.$eval(labelSelector, label => label.getAttribute('for'))
    const inputElement = await page.waitForSelector(
      `#${forAttributeValue}`,
      applyDefaultWaitForOpts(opts)
    )
    // eslint-disable-next-line
    const isChecked = await page.evaluate(checkbox => checkbox.checked, inputElement)

    if (!isChecked) {
      return {
        pass: false,
        message: () => `Found element with text: ${expectedText}, but it was not checked`,
      }
    }

    return {
      pass: true,
      message: () => {
        throw new Error('cannot negate toHaveChecked, try toHaveUnchecked')
      },
    }
  } catch {
    return {
      pass: false,
      message: () => `Expected page to have checked checkbox with text: "${expectedText}"`,
    }
  }
}
