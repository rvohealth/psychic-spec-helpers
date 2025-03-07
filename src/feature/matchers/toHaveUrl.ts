import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export default async function toHaveUrl(page: Page, expectedUrl: string) {
  requirePuppeteerPage(page)

  return await evaluateWithRetryAndTimeout(
    page,
    async () => {
      return {
        pass: page.url() === expectedUrl,
        actual: expectedUrl,
      }
    },
    {
      successText: () => `Expected page to have path: "${expectedUrl}"`,
      failureText: () => `Expected page not to have path: "${expectedUrl}"`,
    }
  )
}
