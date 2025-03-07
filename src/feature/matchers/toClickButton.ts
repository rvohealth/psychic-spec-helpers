import { Page, TimeoutError } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import evaluationFailure from '../internal/evaluationFailure.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export default async function toClickButton(page: Page, expectedText: string) {
  return await evaluateWithRetryAndTimeout(
    page,
    async () => {
      requirePuppeteerPage(page)

      try {
        const el = await page.locator(`button ::-p-text(${expectedText})`).setTimeout(10).wait()
        await el.click()
      } catch (err) {
        if (err instanceof TimeoutError) return evaluationFailure(expectedText)
        throw err
      }

      return {
        pass: true,
        actual: expectedText,
      }
    },
    {
      successText: () => `Expected page to have clickable button with text: "${expectedText}"`,
      failureText: () => `Expected page not to have clickable button with text: "${expectedText}"`,
    }
  )
}
