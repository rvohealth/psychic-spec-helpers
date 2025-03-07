import { Page } from 'puppeteer'
import evaluateWithRetryAndTimeout, {
  ExpectToEvaluateOpts,
  ExpectToEvaluateReturnType,
} from '../internal/evaluateWithRetryAndTimeout.js'
import toHaveSelector from '../matchers/toHaveSelector.js'
import toMatchTextContent from '../matchers/toMatchTextContent.js'
import toNotHaveSelector from '../matchers/toNotHaveSelector.js'
import toNotMatchTextContent from '../matchers/toNotMatchTextContent.js'
import toCheck from '../matchers/toCheck.js'
import toUncheck from '../matchers/toUncheck.js'
import toClick from '../matchers/toClick.js'
import toClickLink from '../matchers/toClickLink.js'
import toClickButton from '../matchers/toClickButton.js'
import toClickSelector from '../matchers/toClickSelector.js'
import toHavePath from '../matchers/toHavePath.js'
import toHaveUrl from '../matchers/toHaveUrl.js'
import toHaveLink from '../matchers/toHaveLink.js'
import toHaveChecked from '../matchers/toHaveChecked.js'
import toHaveUnchecked from '../matchers/toHaveUnchecked.js'
import toFill from '../matchers/toFill.js'

export default function providePuppeteerViteMatchers() {
  ;((global as any).expect as any).extend({
    async toMatchTextContent(page: Page, text: string) {
      return await toMatchTextContent(page, text)
    },

    async toNotMatchTextContent(page: Page, text: string) {
      return await toNotMatchTextContent(page, text)
    },

    async toHaveSelector(page: Page, cssSelector: string) {
      return await toHaveSelector(page, cssSelector)
    },

    async toNotHaveSelector(page: Page, cssSelector: string) {
      return await toNotHaveSelector(page, cssSelector)
    },

    async toCheck(page: Page, text: string) {
      return await toCheck(page, text)
    },

    async toClick(page: Page, text: string) {
      return await toClick(page, text)
    },

    async toClickLink(page: Page, text: string) {
      return await toClickLink(page, text)
    },

    async toClickButton(page: Page, text: string) {
      return await toClickButton(page, text)
    },

    async toClickSelector(page: Page, cssSelector: string) {
      return await toClickSelector(page, cssSelector)
    },

    async toHavePath(page: Page, path: string) {
      return await toHavePath(page, path)
    },

    async toHaveUrl(page: Page, url: string) {
      return await toHaveUrl(page, url)
    },

    async toHaveChecked(page: Page, text: string) {
      return await toHaveChecked(page, text)
    },

    async toHaveUnchecked(page: Page, checked: string) {
      return await toHaveUnchecked(page, checked)
    },

    async toHaveLink(page: Page, text: string) {
      return await toHaveLink(page, text)
    },

    async toFill(page: Page, cssSelector: string, text: string) {
      return await toFill(page, cssSelector, text)
    },

    async toUncheck(page: Page, text: string) {
      return await toUncheck(page, text)
    },

    async toEvaluate(
      argumentPassedToExpect: Page,
      evaluationFn: (a: any) => ExpectToEvaluateReturnType | Promise<ExpectToEvaluateReturnType>,
      opts: ExpectToEvaluateOpts
    ) {
      return await evaluateWithRetryAndTimeout(argumentPassedToExpect, evaluationFn, opts)
    },
  })
}

export interface CustomMatcherResult {
  pass: boolean
  message: (actual?: unknown) => string
}
