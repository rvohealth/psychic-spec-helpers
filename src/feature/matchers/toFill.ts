import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import evaluationFailure from '../internal/evaluationFailure.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export default async function toFill(page: Page, cssSelector: string, text: string) {
  return await evaluateWithRetryAndTimeout(
    page,
    async () => {
      requirePuppeteerPage(page)

      try {
        await page.type(cssSelector, text)
      } catch {
        return evaluationFailure(text)
      }

      return {
        pass: true,
        actual: text,
      }
    },
    {
      successText: () => `Expected page to have clickable link with text: "${text}"`,
      failureText: () => `Expected page not to have clickable link with text: "${text}"`,
    }
  )
}
