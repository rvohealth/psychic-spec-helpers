import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import getAllTextContentFromPage from '../internal/getAllTextContentFromPage.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'
import type { TextContentMatcherExpected, TextContentMatcherOpts } from './toMatchTextContent.js'

/**
 * Assert absence of a string or regular expression from rendered text and
 * displayed input/textarea values in the selector scope. Uses the same
 * display:none, visibility:hidden and type=hidden exclusions as
 * toMatchTextContent; opacity-zero and offscreen content remain eligible.
 */
export default async function toNotMatchTextContent(
  argumentPassedToExpect: Page,
  expected: TextContentMatcherExpected,
  opts: TextContentMatcherOpts = {}
) {
  return await evaluateWithRetryAndTimeout(
    argumentPassedToExpect,
    async () => {
      requirePuppeteerPage(argumentPassedToExpect)

      const actual = await getAllTextContentFromPage(argumentPassedToExpect, opts.selector)
      if (expected instanceof RegExp) expected.lastIndex = 0

      return {
        pass: typeof expected === 'string' ? !actual.includes(expected) : !expected.test(actual),
        actual,
      }
    },
    {
      successText: () => {
        throw new Error('Cannot negate toNotMatchTextContent, use toMatchTextContent instead')
      },
      failureText: r => `Expected ${r} to not match text ${expected.toString()}, but it did`,
      timeout: opts.timeout,
    }
  )
}
