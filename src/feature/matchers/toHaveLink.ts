import { Page, TimeoutError } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import evaluationFailure from '../internal/evaluationFailure.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export default async function toHaveLink(page: Page, expectedText: string) {
  return await evaluateWithRetryAndTimeout(
    page,
    async () => {
      requirePuppeteerPage(page)

      let el: any = undefined
      try {
        el = await page.locator(`a ::-p-text(${expectedText})`).setTimeout(10).wait()
      } catch (err) {
        if (err instanceof TimeoutError) return evaluationFailure(expectedText)
        throw err
      }

      return {
        pass: !!el,
        actual: expectedText,
      }
    },
    {
      successText: () => `Expected page to have clickable link with text: "${expectedText}"`,
      failureText: () => `Expected page not to have clickable link with text: "${expectedText}"`,
    }
  )
}
