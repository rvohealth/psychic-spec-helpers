import { ElementHandle, Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'
import emptyForAttribute from '../error-messages/emptyForAttribute.js'
import missingInputToMatchForAttribute from '../error-messages/missingInputToMatchForAttribute.js'
import captureAttributeFromClosestElementWithType from '../internal/captureAttributeFromClosestElementWithType.js'

export default async function toUncheck(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  try {
    const labelSelector = `label::-p-text("${expectedText}")`
    const forAttributeValue = await captureAttributeFromClosestElementWithType(
      labelSelector,
      'label',
      'for'
    )
    if (!forAttributeValue) {
      return {
        pass: false,
        message: () => emptyForAttribute(),
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let inputElement: ElementHandle<any> | null = null
    try {
      inputElement = await page.waitForSelector(
        `#${forAttributeValue}`,
        applyDefaultWaitForOpts(opts)
      )
    } catch {
      return {
        pass: false,
        message: () => missingInputToMatchForAttribute(forAttributeValue),
      }
    }

    // eslint-disable-next-line
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
  } catch {
    return {
      pass: false,
      message: () => `Expected page to have checkable element with text: "${expectedText}"`,
    }
  }
}
