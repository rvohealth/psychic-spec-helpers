import { ExpectToEvaluateOpts } from './feature/internal/evaluateWithRetryAndTimeout.js'
import { CustomMatcherResult } from './feature/helpers/providePuppeteerViteMatchers.js'
import { Page, WaitForSelectorOptions } from 'puppeteer'
import { ToFillMatcherOpts } from './feature/matchers/toFill.js'

// unit spec helpers
export { default as specRequest } from './unit/SpecRequest.js'
export { default as createPsychicServer } from './unit/createPsychicServer.js'
export { OpenapiSpecRequest } from './unit/OpenapiSpecRequest.js'
export { OpenapiSpecSession } from './unit/OpenapiSpecSession.js'
export { SpecRequest } from './unit/SpecRequest.js'
export { SpecSession } from './unit/SpecSession.js'

// feature spec helpers
export { default as providePuppeteerViteMatchers } from './feature/helpers/providePuppeteerViteMatchers.js'
export { default as launchBrowser } from './feature/helpers/launchBrowser.js'
export { default as launchPage } from './feature/helpers/launchPage.js'
export {
  default as launchDevServer,
  stopDevServers,
  stopDevServer,
} from './feature/helpers/launchDevServer.js'
export { default as visit } from './feature/helpers/visit.js'

declare global {
  // @ts-expect-error context redefined
  const context: (typeof import('vitest'))['describe']

  const page: InstanceType<typeof Page>
  const visit: (typeof import('./feature/helpers/visit.js'))['default']
  const check: (typeof import('./feature/helpers/matcher-globals/check.js'))['default']
  const click: (typeof import('./feature/helpers/matcher-globals/click.js'))['default']
  const clickButton: (typeof import('./feature/helpers/matcher-globals/clickButton.js'))['default']
  const clickLink: (typeof import('./feature/helpers/matcher-globals/clickLink.js'))['default']
  const clickSelector: (typeof import('./feature/helpers/matcher-globals/clickSelector.js'))['default']
  const fillIn: (typeof import('./feature/helpers/matcher-globals/fillIn.js'))['default']
  const select: (typeof import('./feature/helpers/matcher-globals/select.js'))['default']
  const uncheck: (typeof import('./feature/helpers/matcher-globals/uncheck.js'))['default']
}

declare module 'vitest' {
  // eslint-disable-next-line
  interface ExpectStatic extends PuppeteerAssertions {}
  // eslint-disable-next-line
  interface Assertion extends PuppeteerAssertions {}
}

interface PuppeteerAssertions {
  // begin: dream matchers
  // eslint-disable-next-line
  toMatchDreamModel(expected: any): CustomMatcherResult
  // eslint-disable-next-line
  toMatchDreamModels(expected: any): CustomMatcherResult
  toBeWithin(precision: number, expected: number): CustomMatcherResult
  // eslint-disable-next-line
  toEqualCalendarDate(expected: any): CustomMatcherResult

  // begin: fspec matchers
  // eslint-disable-next-line
  toMatchTextContent(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toNotMatchTextContent(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toHaveSelector(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toNotHaveSelector(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toCheck(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toClick(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toSelect(
    cssSelector: string,
    optionText: string,
    opts?: WaitForSelectorOptions
  ): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toClickLink(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toClickButton(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toClickSelector(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toHavePath(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toHaveUrl(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toHaveChecked(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toHaveUnchecked(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toHaveLink(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toFill(cssSelector: string, text: string, opts?: ToFillMatcherOpts): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toUncheck(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toEvaluate(
    // eslint-disable-next-line
    expected: (a: any) => boolean | Promise<boolean>,
    opts: ExpectToEvaluateOpts
  ): Promise<CustomMatcherResult>
}

export default {}
