import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export default async function toHavePath(page: Page, expectedPath: string) {
  requirePuppeteerPage(page)

  return await evaluateWithRetryAndTimeout(
    page,
    async () => {
      const pathname = new URL(page.url()).pathname

      return {
        pass: pathname === expectedPath,
        actual: expectedPath,
      }
    },
    {
      successText: () => {
        throw new Error('cannot negate toHavePath')
      },
      failureText: () => `Expected page not to have path: "${expectedPath}"`,
    }
  )
}
