import { ExpectToEvaluateOpts } from './feature/internal/evaluateWithRetryAndTimeout.js'
import { CustomMatcherResult } from './feature/helpers/providePuppeteerViteMatchers.js'
import { Page, WaitForSelectorOptions } from 'puppeteer'
import { ToFillMatcherOpts } from './feature/matchers/toFill.js'

// unit spec helpers
export { default as specRequest } from './unit/SpecRequest.js'
export { default as createPsychicServer } from './unit/createPsychicServer.js'
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
  function context(description: string, callback: () => void): void
  const page: InstanceType<typeof Page>
}

declare module 'vitest' {
  interface ExpectStatic extends PuppeteerAssertions {}
  interface Assertion extends PuppeteerAssertions {}
}

interface PuppeteerAssertions {
  // begin: dream matchers
  toMatchDreamModel(expected: any): CustomMatcherResult
  toMatchDreamModels(expected: any): CustomMatcherResult
  toBeWithin(precision: number, expected: number): CustomMatcherResult
  toEqualCalendarDate(expected: any): CustomMatcherResult

  // begin: fspec matchers
  toMatchTextContent(expected: any): Promise<CustomMatcherResult>
  toNotMatchTextContent(expected: any): Promise<CustomMatcherResult>
  toHaveSelector(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toNotHaveSelector(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toCheck(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toClick(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toClickLink(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toClickButton(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toClickSelector(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toHavePath(expected: any): Promise<CustomMatcherResult>
  toHaveUrl(expected: any): Promise<CustomMatcherResult>
  toHaveChecked(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toHaveUnchecked(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toHaveLink(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toFill(cssSelector: string, text: string, opts?: ToFillMatcherOpts): Promise<CustomMatcherResult>
  toUncheck(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toEvaluate(
    expected: (a: any) => boolean | Promise<boolean>,
    opts: ExpectToEvaluateOpts
  ): Promise<CustomMatcherResult>
}

export default {}
