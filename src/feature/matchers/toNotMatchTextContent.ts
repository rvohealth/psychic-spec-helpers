import { Page, WaitForSelectorOptions } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import getAllTextContentFromPage from '../internal/getAllTextContentFromPage.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export default async function toNotMatchTextContent(
  argumentPassedToExpect: Page,
  expected: string,
  opts: WaitForSelectorOptions = {}
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
      successText: () => {
        throw new Error('Cannot negate toNotMatchTextContent, use toMatchTextContent instead')
      },
      failureText: r => `Expected ${r} to match text ${expected}`,
      timeout: opts.timeout,
    }
  )
}
