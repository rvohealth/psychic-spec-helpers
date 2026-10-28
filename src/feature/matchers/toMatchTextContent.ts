import { Page, WaitForSelectorOptions } from 'puppeteer'
import evaluateWithRetryAndTimeout from '../internal/evaluateWithRetryAndTimeout.js'
import getAllTextContentFromPage from '../internal/getAllTextContentFromPage.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export type TextContentMatcherExpected = string | RegExp
export type TextContentMatcherOpts = { selector?: string } & WaitForSelectorOptions

/**
 * Match rendered text or displayed input/textarea values in the selector scope.
 * Excludes display:none ancestry, visibility:hidden (or collapse) text/values and
 * type=hidden inputs. Opacity-zero and offscreen content remain eligible. Text is the
 * browser's innerText, so in Chrome the label of a hidden option inside a displayed select
 * still matches. Accepts strings and regular expressions; toNotMatchTextContent is the
 * complementary assertion.
 */
export default async function toMatchTextContent(
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
        pass: typeof expected === 'string' ? actual.includes(expected) : expected.test(actual),
        actual,
      }
    },
    {
      successText: () => {
        throw new Error('Cannot negate toMatchTextContent, use toNotMatchTextContent instead')
      },
      failureText: actual => `
expected ${opts.selector || 'body'} with text:
        ${expected.toString()}

but no matching text was found within that selector:
        ${actual}
      `,
      timeout: opts.timeout,
    }
  )
}
