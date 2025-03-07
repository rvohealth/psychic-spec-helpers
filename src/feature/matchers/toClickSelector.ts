import { Page, TimeoutError } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import evaluationFailure from '../internal/evaluationFailure.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export default async function toClickSelector(page: Page, cssSelector: string) {
  return await evaluateWithRetryAndTimeout(
    page,
    async () => {
      requirePuppeteerPage(page)

      try {
        const el = await page.locator(cssSelector).setTimeout(10).wait()
        await el.click()
      } catch (err) {
        if (err instanceof TimeoutError) return evaluationFailure(cssSelector)
        throw err
      }

      return {
        pass: true,
        actual: cssSelector,
      }
    },
    {
      successText: () => `Expected page to have clickable selector with text: "${cssSelector}"`,
      failureText: () => `Expected page not to have clickable selector with text: "${cssSelector}"`,
    }
  )
}
