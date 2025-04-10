import { Page, WaitForSelectorOptions } from 'puppeteer'
import evaluateWithRetryAndTimeout, {
  ExpectToEvaluateOpts,
  ExpectToEvaluateReturnType,
} from '../internal/evaluateWithRetryAndTimeout.js'
import toCheck from '../matchers/toCheck.js'
import toClick from '../matchers/toClick.js'
import toClickButton from '../matchers/toClickButton.js'
import toClickLink from '../matchers/toClickLink.js'
import toClickSelector from '../matchers/toClickSelector.js'
import toFill, { ToFillMatcherOpts } from '../matchers/toFill.js'
import toHaveChecked from '../matchers/toHaveChecked.js'
import toHaveLink from '../matchers/toHaveLink.js'
import toHavePath from '../matchers/toHavePath.js'
import toHaveSelector from '../matchers/toHaveSelector.js'
import toHaveUnchecked from '../matchers/toHaveUnchecked.js'
import toHaveUrl from '../matchers/toHaveUrl.js'
import toMatchTextContent from '../matchers/toMatchTextContent.js'
import toNotHaveSelector from '../matchers/toNotHaveSelector.js'
import toNotMatchTextContent from '../matchers/toNotMatchTextContent.js'
import toUncheck from '../matchers/toUncheck.js'
import check from './matcher-globals/check.js'
import click from './matcher-globals/click.js'
import clickButton from './matcher-globals/clickButton.js'
import clickLink from './matcher-globals/clickLink.js'
import clickSelector from './matcher-globals/clickSelector.js'
import fillIn from './matcher-globals/fillIn.js'
import uncheck from './matcher-globals/uncheck.js'
import visit from './visit.js'

export default function providePuppeteerViteMatchers() {
  ;((global as any).expect as any).extend({
    async toMatchTextContent(
      page: Page,
      text: string,
      opts?: { selector?: string } & WaitForSelectorOptions
    ) {
      return await toMatchTextContent(page, text, opts)
    },

    async toNotMatchTextContent(page: Page, text: string) {
      return await toNotMatchTextContent(page, text)
    },

    async toHaveSelector(page: Page, cssSelector: string, opts?: WaitForSelectorOptions) {
      return await toHaveSelector(page, cssSelector, opts)
    },

    async toNotHaveSelector(page: Page, cssSelector: string, opts?: WaitForSelectorOptions) {
      return await toNotHaveSelector(page, cssSelector, opts)
    },

    async toCheck(page: Page, text: string, opts?: WaitForSelectorOptions) {
      return await toCheck(page, text, opts)
    },

    async toClick(page: Page, text: string, opts?: WaitForSelectorOptions) {
      return await toClick(page, text, opts)
    },

    async toClickLink(page: Page, text: string, opts?: WaitForSelectorOptions) {
      return await toClickLink(page, text, opts)
    },

    async toClickButton(page: Page, text: string, opts?: WaitForSelectorOptions) {
      return await toClickButton(page, text, opts)
    },

    async toClickSelector(page: Page, cssSelector: string, opts?: WaitForSelectorOptions) {
      return await toClickSelector(page, cssSelector, opts)
    },

    async toHavePath(page: Page, path: string) {
      return await toHavePath(page, path)
    },

    async toHaveUrl(page: Page, url: string) {
      return await toHaveUrl(page, url)
    },

    async toHaveChecked(page: Page, text: string, opts?: WaitForSelectorOptions) {
      return await toHaveChecked(page, text, opts)
    },

    async toHaveUnchecked(page: Page, checked: string, opts?: WaitForSelectorOptions) {
      return await toHaveUnchecked(page, checked, opts)
    },

    async toHaveLink(page: Page, text: string, opts?: WaitForSelectorOptions) {
      return await toHaveLink(page, text, opts)
    },

    async toFill(page: Page, cssSelector: string, text: string, opts?: ToFillMatcherOpts) {
      return await toFill(page, cssSelector, text, opts)
    },

    async toUncheck(page: Page, text: string, opts?: WaitForSelectorOptions) {
      return await toUncheck(page, text, opts)
    },

    async toEvaluate(
      argumentPassedToExpect: Page,
      evaluationFn: (a: any) => ExpectToEvaluateReturnType | Promise<ExpectToEvaluateReturnType>,
      opts: ExpectToEvaluateOpts
    ) {
      return await evaluateWithRetryAndTimeout(argumentPassedToExpect, evaluationFn, opts)
    },
  })

  // set globals

  // define global context variable, setting it equal to describe
  ;(global as any).context ||= describe

  // define global helper functions
  ;(global as any).check = check
  ;(global as any).click = click
  ;(global as any).clickButton = clickButton
  ;(global as any).clickLink = clickLink
  ;(global as any).clickSelector = clickSelector
  ;(global as any).fillIn = fillIn
  ;(global as any).uncheck = uncheck
  ;(global as any).visit = visit
}

export interface CustomMatcherResult {
  pass: boolean
  message: (actual?: unknown) => string
}
