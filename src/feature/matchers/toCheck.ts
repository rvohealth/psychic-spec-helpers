import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'
import emptyForAttribute from '../error-messages/emptyForAttribute.js'
import missingInputToMatchForAttribute from '../error-messages/missingInputToMatchForAttribute.js'
import captureAttributeFromClosestElementWithType from '../internal/captureAttributeFromClosestElementWithType.js'

export default async function toCheck(
  page: Page,
  expectedText: string,
  opts?: WaitForSelectorOptions
) {
  const failure = {
    pass: false,
    message: () => `Expected page to have checkable element with text: "${expectedText}"`,
  }

  const labelSelector = `label::-p-text("${expectedText}")`
  try {
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

    try {
      await page.waitForSelector(`#${forAttributeValue}`, applyDefaultWaitForOpts(opts))
    } catch {
      return {
        pass: false,
        message: () => missingInputToMatchForAttribute(forAttributeValue),
      }
    }

    await expect(page).toClickSelector(labelSelector, applyDefaultWaitForOpts(opts))
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
