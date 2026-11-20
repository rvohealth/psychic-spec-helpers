import { Page, WaitForSelectorOptions } from 'puppeteer'
import { CustomMatcherResult } from './feature/helpers/providePuppeteerViteMatchers.js'
import type {
  ExpectToEvaluateOpts,
  ExpectToEvaluateReturnType,
} from './feature/internal/evaluateWithRetryAndTimeout.js'
import { ToFillMatcherOpts } from './feature/matchers/toFill.js'
import type { SelectMatcherOpts } from './feature/matchers/toHaveSelected.js'
import type { ValueMatcherExpected, ValueMatcherOpts } from './feature/matchers/toHaveValue.js'
import type {
  TextContentMatcherExpected,
  TextContentMatcherOpts,
} from './feature/matchers/toMatchTextContent.js'
export {
  RequestBody as OpenapiRequestBody,
  RequestQueryParameters as OpenapiRequestQuery,
  ResponseBody as OpenapiResponseBody,
  ResponseCodeForUri as OpenapiResponseCodeForUri,
} from './unit/helpers/openapiTypeHelpers.js'

// type helpers
export { DreamRequestAttributes } from './unit/helpers/typeHelpers.js'

// unit spec helpers
export { default as createPsychicServer } from './unit/createPsychicServer.js'
export { OpenapiSpecRequest } from './unit/OpenapiSpecRequest.js'
export { OpenapiSpecSession } from './unit/OpenapiSpecSession.js'
export { default as specRequest, SpecRequest } from './unit/SpecRequest.js'
export { SpecSession } from './unit/SpecSession.js'

// feature spec helpers
export { default as launchBrowser } from './feature/helpers/launchBrowser.js'
export {
  default as launchDevServer,
  stopDevServer,
  stopDevServers,
} from './feature/helpers/launchDevServer.js'
export { default as launchPage } from './feature/helpers/launchPage.js'
export { default as providePuppeteerViteMatchers } from './feature/helpers/providePuppeteerViteMatchers.js'
export { default as resetBrowserState } from './feature/helpers/resetBrowserState.js'
export { default as visit } from './feature/helpers/visit.js'

declare global {
  // `context` is deliberately NOT declared here: @rvoh/dream-spec-helpers (always
  // present alongside this package in a psychic app) already declares it, and a
  // second declaration is a TS2451 redeclare error whenever both declarations are
  // checked in one program (e.g. this repo's own test-app build, where this file
  // is source rather than a skipLibCheck-suppressed .d.ts).

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
  // vitest >= 3.2 matcher augmentation point (covers expect(), expect.soft, asymmetric
  // matchers); augmenting Assertion/ExpectStatic no longer merges under vitest 4
  // eslint-disable-next-line
  interface Matchers<T = any> extends PuppeteerAssertions {}
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
  /**
   * Match a string or RegExp in rendered text and displayed input/textarea values,
   * optionally scoped by selector. Feature specs are user stories, so only text a
   * user can see counts. Excludes display:none ancestry,
   * visibility:hidden (or collapse) content and input[type=hidden] values; opacity-zero and
   * offscreen content remain eligible. Select menus are form controls, not text, and are
   * ignored; assert on them with toHaveSelected and toHaveUnselected.
   */
  toMatchTextContent(
    expected: TextContentMatcherExpected,
    opts?: TextContentMatcherOpts
  ): Promise<CustomMatcherResult>
  /** Assert absence using the same text/value scope and exclusions as toMatchTextContent. */
  toNotMatchTextContent(
    expected: TextContentMatcherExpected,
    opts?: TextContentMatcherOpts
  ): Promise<CustomMatcherResult>
  /**
   * Assert that an element matching the selector is in the DOM, visible or not,
   * waiting until the timeout. With an attribute selector it waits for a state
   * the page records in an attribute, such as a Radix control's
   * `toHaveSelector('#venue-other[data-state="checked"]')`, or a React-controlled
   * input's `toHaveSelector('#place-name[value="Trailhead"]')` (React mirrors a
   * controlled input's value into its value attribute). A failure says only that
   * nothing matched, not what the attribute held; to see the actual state or
   * value, use toHaveChecked/toHaveUnchecked or toHaveValue/toNotHaveValue,
   * which also read a value typed into an input whose value attribute was never
   * updated.
   */
  // eslint-disable-next-line
  toHaveSelector(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toNotHaveSelector(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  /**
   * Check the checkbox, radio or switch that the text names (found as for
   * toHaveChecked, except that a label whose text sits in a child element
   * still names its control with its for attribute, as it always has). A control that is already checked is left as it is and
   * passes; otherwise it is clicked once, through its label when a label's for
   * attribute names it, or directly when it was found by its accessible name.
   * It waits up to 3000ms for a label to appear, and then up to the timeout
   * (5000ms by default) for the control.
   */
  // eslint-disable-next-line
  toCheck(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toClick(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  /**
   * Select the option whose value attribute (not its label) is optionValue in the
   * select matching cssSelector. A value no option has does not fail: every option
   * is deselected, and a single-choice select falls back to its first option.
   * Confirm the result with toHaveSelected.
   */
  toSelect(
    cssSelector: string,
    optionValue: string,
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
  /**
   * Assert that the checkbox, radio or switch that the text names is checked,
   * retrying until the timeout (5000ms by default). The failure names the
   * control and its actual state.
   *
   * The control: the first label, in document order, whose text contains the
   * text (case-sensitive) names it with its for attribute: the first element
   * matching the CSS selector `#` + for that meets the visible or hidden
   * option, which may be any element, such as a Radix
   * `button[role="checkbox"]`. When no label contains the text, when the
   * element holding the text has no for attribute (a wrapping label, or text
   * in a child element of the label), or when the for value is not valid CSS
   * (a React 18 id like `:r0:`), Playwright's getByLabel rule applies to
   * checkboxes, radios and switches (native, or by ARIA role): a for or
   * wrapping label, aria-labelledby or aria-label whose text contains the text,
   * ignoring case and extra whitespace. More than one such control fails,
   * naming them.
   *
   * Its state: the native checked property, or, for an element without one,
   * aria-checked ("true" is checked; "mixed" is neither checked nor unchecked).
   * An element with neither counts as unchecked.
   */
  // eslint-disable-next-line
  toHaveChecked(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  /**
   * Assert that the checkbox, radio or switch that the text names (found as for
   * toHaveChecked) is unchecked, retrying until the timeout (5000ms by
   * default). A mixed (aria-checked="mixed") control is not unchecked. The
   * failure names the control and its actual state.
   */
  // eslint-disable-next-line
  toHaveUnchecked(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  /**
   * Assert that the select matching cssSelector has the option whose value is
   * optionValue selected. Like toSelect, this matches the option's value attribute,
   * not its label. Select menus are form controls, so the text matchers ignore them.
   */
  toHaveSelected(
    cssSelector: string,
    optionValue: string,
    opts?: SelectMatcherOpts
  ): Promise<CustomMatcherResult>
  /**
   * Assert that the select matching cssSelector has an option whose value is
   * optionValue and that it is not selected. A missing select or option fails.
   */
  toHaveUnselected(
    cssSelector: string,
    optionValue: string,
    opts?: SelectMatcherOpts
  ): Promise<CustomMatcherResult>
  /**
   * Assert that the first input, textarea or select matching cssSelector that a
   * user can see has a value equal to expected (a string) or matching it (a
   * RegExp), retrying until the timeout (4000ms by default). It reads the
   * field's value property, so it sees what was typed or set by a script even
   * when the value attribute was never updated; a select's value is its first
   * selected option's value. A field hidden by display:none,
   * visibility:hidden (or collapse) or type=hidden counts as missing, as it does
   * for toMatchTextContent, and a missing field fails. The failure names the
   * selector, the expected value and the actual value.
   */
  toHaveValue(
    cssSelector: string,
    expected: ValueMatcherExpected,
    opts?: ValueMatcherOpts
  ): Promise<CustomMatcherResult>
  /**
   * Assert that the first input, textarea or select matching cssSelector that a
   * user can see has a value that is not equal to unexpected (a string) and does
   * not match it (a RegExp), retrying until the timeout (4000ms by default). A
   * missing or hidden field fails, so a typo in the selector cannot pass.
   */
  toNotHaveValue(
    cssSelector: string,
    unexpected: ValueMatcherExpected,
    opts?: ValueMatcherOpts
  ): Promise<CustomMatcherResult>
  // eslint-disable-next-line
  toHaveLink(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  toFill(cssSelector: string, text: string, opts?: ToFillMatcherOpts): Promise<CustomMatcherResult>
  /**
   * Uncheck the checkbox, radio or switch that the text names (found as for
   * toHaveChecked, except that a label whose text sits in a child element
   * still names its control with its for attribute, as it always has). A control that is already unchecked is left as it is and
   * passes; otherwise it is clicked once, through its label when a label's for
   * attribute names it, or directly when it was found by its accessible name,
   * and must then become unchecked within 5000ms. It waits up to 3000ms for a
   * label to appear, and then up to the timeout (5000ms by default) for the
   * control.
   */
  // eslint-disable-next-line
  toUncheck(expected: any, opts?: WaitForSelectorOptions): Promise<CustomMatcherResult>
  /**
   * Retry a synchronous or asynchronous callback receiving the value passed to
   * expect until its { pass, actual } result passes or the timeout expires.
   * failureText receives the final actual value; optional successText receives
   * the successful actual value for negated assertion diagnostics.
   */
  toEvaluate(
    // eslint-disable-next-line
    expected: (a: any) => ExpectToEvaluateReturnType | Promise<ExpectToEvaluateReturnType>,
    opts: ExpectToEvaluateOpts
  ): Promise<CustomMatcherResult>
}

export default {}
