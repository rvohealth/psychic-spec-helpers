import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export default async function toNotHaveSelector(page: Page, expectedSelector: string) {
  return await evaluateWithRetryAndTimeout(
    page,
    async () => {
      requirePuppeteerPage(page)

      return {
        pass: !(await page.$(expectedSelector)),
        actual: expectedSelector,
      }
    },
    {
      successText: r => `Expected ${r} not to have selector: ${expectedSelector}`,
      failureText: r => `Expected ${r} to have selector: ${expectedSelector}`,
    }
  )
}
