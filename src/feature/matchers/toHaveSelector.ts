import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'

export default async function toHaveSelector(
  page: Page,
  selector: string,
  opts?: WaitForSelectorOptions
) {
  // Presence-only contract: this matcher asserts that the selector is
  // attached to the DOM, regardless of visibility. Strip visible/hidden so
  // a caller-passed { visible: true } can't narrow the check to also
  // require visibility.
  const waitForOpts = applyDefaultWaitForOpts(opts)
  delete waitForOpts.visible
  delete waitForOpts.hidden

  try {
    await page.waitForSelector(selector, waitForOpts)
    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toHaveSelector, use toNotHaveSelector instead')
      },
    }
  } catch {
    return {
      pass: false,
      message: () => `
expected selector: ${selector}
but no selector was found
      `,
    }
  }
}
