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
import select from './matcher-globals/select.js'
import uncheck from './matcher-globals/uncheck.js'
import visit from './visit.js'
import toSelect from '../matchers/toSelect.js'

export default function providePuppeteerViteMatchers() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(global as any).expect.extend({
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

    async toSelect(
      page: Page,
      cssSelector: string,
      optionText: string,
      opts?: WaitForSelectorOptions
    ) {
      return await toSelect(page, cssSelector, optionText, opts)
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

    async toHavePath(page: Page, path: string, opts?: WaitForSelectorOptions) {
      return await toHavePath(page, path, opts)
    },

    async toHaveUrl(page: Page, url: string, opts?: WaitForSelectorOptions) {
      return await toHaveUrl(page, url, opts)
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      evaluationFn: (a: any) => ExpectToEvaluateReturnType | Promise<ExpectToEvaluateReturnType>,
      opts: ExpectToEvaluateOpts
    ) {
      return await evaluateWithRetryAndTimeout(argumentPassedToExpect, evaluationFn, opts)
    },
  })

  // set globals

  // define global context variable, setting it equal to describe
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(global as any).context ||= describe

  // define global helper functions
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(global as any).check = check
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(global as any).click = click
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(global as any).clickButton = clickButton
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(global as any).clickLink = clickLink
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(global as any).clickSelector = clickSelector
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(global as any).fillIn = fillIn
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(global as any).select = select
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(global as any).uncheck = uncheck
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(global as any).visit = visit
}

export interface CustomMatcherResult {
  pass: boolean
  message: (actual?: unknown) => string
}
