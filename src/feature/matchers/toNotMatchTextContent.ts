import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import getAllTextContentFromPage from '../internal/getAllTextContentFromPage.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export default async function toNotMatchTextContent(
  argumentPassedToExpect: Page,
  expected: string
) {
  return await evaluateWithRetryAndTimeout(
    argumentPassedToExpect,
    async () => {
      requirePuppeteerPage(argumentPassedToExpect)

      const actual = await getAllTextContentFromPage(argumentPassedToExpect)
      return {
        pass: !actual.includes(expected),
        actual,
      }
    },
    {
      successText: r => `Expected ${r} not to match text ${expected}`,
      failureText: r => `Expected ${r} to match text ${expected}`,
    }
  )
}
