import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import evaluationFailure from '../internal/evaluationFailure.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export default async function toHaveChecked(page: Page, expectedText: string) {
  return await evaluateWithRetryAndTimeout(
    page,
    async () => {
      requirePuppeteerPage(page)

      const checkbox = await page.$(`input[type="checkbox"][value="${expectedText}"]`)
      if (!checkbox) return evaluationFailure(`A checkbox was not found with "${expectedText}"`)

      const isChecked = await page.evaluate(checkbox => checkbox.checked, checkbox)
      return {
        pass: isChecked,
        actual: expectedText,
      }
    },
    {
      successText: r => `Expected page to have checked checkbox with text: "${expectedText}"`,
      failureText: r => `Expected page not to have checked checkbox with text: "${expectedText}"`,
    }
  )
}
