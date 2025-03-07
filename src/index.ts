import { ExpectToEvaluateOpts } from './feature/internal/evaluateWithRetryAndTimeout.js'
import { CustomMatcherResult } from './feature/helpers/providePuppeteerViteMatchers.js'

// unit spec helpers
export { default as specRequest } from './unit/SpecRequest.js'
export { default as createPsychicServer } from './unit/createPsychicServer.js'
export { SpecRequest } from './unit/SpecRequest.js'
export { SpecSession } from './unit/SpecSession.js'

// feature spec helpers
export { default as providePuppeteerViteMatchers } from './feature/helpers/providePuppeteerViteMatchers.js'
export { default as launchBrowser } from './feature/helpers/launchBrowser.js'
export { default as launchPage } from './feature/helpers/launchPage.js'
export { default as launchViteServer, stopViteServer } from './feature/helpers/launchViteServer.js'
export { default as visit } from './feature/helpers/visit.js'

declare global {
  function context(description: string, callback: () => void): void
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
  toHaveSelector(expected: any): Promise<CustomMatcherResult>
  toNotHaveSelector(expected: any): Promise<CustomMatcherResult>
  toCheck(expected: any): Promise<CustomMatcherResult>
  toClick(expected: any): Promise<CustomMatcherResult>
  toClickLink(expected: any): Promise<CustomMatcherResult>
  toClickLink(expected: any): Promise<CustomMatcherResult>
  toClickSelector(expected: any): Promise<CustomMatcherResult>
  toHavePath(expected: any): Promise<CustomMatcherResult>
  toHaveUrl(expected: any): Promise<CustomMatcherResult>
  toHaveChecked(expected: any): Promise<CustomMatcherResult>
  toHaveUnchecked(expected: any): Promise<CustomMatcherResult>
  toHaveLink(expected: any): Promise<CustomMatcherResult>
  toFill(cssSelector: string, text: string): Promise<CustomMatcherResult>
  toUncheck(expected: any): Promise<CustomMatcherResult>
  toEvaluate(
    expected: (a: any) => boolean | Promise<boolean>,
    opts: ExpectToEvaluateOpts
  ): Promise<CustomMatcherResult>
}

export default {}
