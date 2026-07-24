import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'
import sleep from '../../shared/sleep.js'

export default async function toNotHaveSelector(
  page: Page,
  selector: string,
  opts?: WaitForSelectorOptions
) {
  // Presence-only contract: this matcher asserts that the selector is
  // absent from the DOM, regardless of visibility. A present-but-hidden
  // element must FAIL this matcher, so we poll for true DOM absence via
  // page.$ (rather than relying on waitForSelector({ hidden: true }),
  // which only asserts invisibility). page.$ (not document.querySelector)
  // is used so Puppeteer's extended selectors like ::-p-text keep working.
  const timeout = applyDefaultWaitForOpts(opts).timeout ?? 5000
  const interval = 50
  const startTime = Date.now()

  async function poll(): Promise<{ pass: boolean; message: () => string }> {
    const element = await page.$(selector)
    if (!element) {
      return {
        pass: true,
        message: () => {
          throw new Error('Cannot negate toNotHaveSelector, use toHaveSelector instead')
        },
      }
    }

    if (Date.now() >= startTime + timeout) {
      await element.dispose()
      return {
        pass: false,
        message: () => `Expected page to not have selector, but it did: ${selector}`,
      }
    }

    await element.dispose()
    await sleep(interval)
    return await poll()
  }

  return await poll()
}
