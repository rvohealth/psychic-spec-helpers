import { ElementHandle, JSHandle, Page, WaitForSelectorOptions } from 'puppeteer'
import sleep from '../../shared/sleep.js'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'
import { clickBeforeTimeout, ClickOutcome } from './clickBeforeTimeout.js'
import evaluateWithRetryAndTimeout from './evaluateWithRetryAndTimeout.js'
import emptyForAttribute from '../error-messages/emptyForAttribute.js'
import missingInputToMatchForAttribute from '../error-messages/missingInputToMatchForAttribute.js'

/**
 * Whether a checkbox, radio or switch is checked: its native checked property,
 * or, for an element without one (a Radix or other ARIA control), its
 * aria-checked attribute ("true" is checked, "mixed" is mixed, anything else
 * or none is unchecked). An element with neither counts as unchecked, as it
 * always has.
 */
export type CheckedState = 'checked' | 'unchecked' | 'mixed'

export type CheckableObservation =
  | {
      resolved: true
      // label: today's lookup found it (see checkableControlReader);
      // fallback: Playwright's getByLabel rule found it.
      tier: 'label' | 'fallback'
      control: string
      state: CheckedState
    }
  // The label's for attribute names no element (that meets the visible or
  // hidden option) before the timeout. Decisive: the fallback does not run.
  | { resolved: false; reason: 'labelControlMissing'; forValue: string }
  // The label has no (or an empty) for attribute, and the fallback found no
  // control.
  | { resolved: false; reason: 'labelWithoutFor' }
  // The label's for attribute is not usable as a CSS id selector (such as a
  // React 18 id like ":r0:"), and the fallback found no control.
  | { resolved: false; reason: 'invalidFor'; forValue: string }
  | { resolved: false; reason: 'notFound' }
  | { resolved: false; reason: 'ambiguous'; matches: string[] }

/** The label selector these matchers have always used. */
export function checkableLabelSelector(text: string) {
  return `label::-p-text("${text}")`
}

/**
 * The timeout these four matchers have always taken from their
 * WaitForSelectorOptions: 5000ms by default, an explicit undefined is the
 * page's default timeout, and 0 is no limit, as in Puppeteer's
 * waitForSelector (see clickSelectorBeforeTimeout).
 */
export function checkableControlTimeout(page: Page, opts?: WaitForSelectorOptions) {
  const optsTimeout = applyDefaultWaitForOpts(opts).timeout
  const timeout = optsTimeout === undefined ? page.getDefaultTimeout() : optsTimeout
  return timeout === 0 ? Infinity : timeout
}

/**
 * How long toCheck and toUncheck have always waited for a label to appear
 * (fixed, whatever the timeout). The fallback runs only after it, so that a
 * control it would find is not clicked while the label that names another one
 * is still rendering.
 */
export const actionLabelWindow = 3000

const pollInterval = 10

type ControlReading = { control: string; state: CheckedState }

/**
 * Describe a control and read its CheckedState. This runs in the browser and
 * must stay self-contained.
 */
function readControl(element: unknown): ControlReading {
  const control = element as {
    tagName: string
    id: string
    type?: string
    checked?: unknown
    getAttribute: (name: string) => string | null
  }
  const tagName = String(control.tagName).toLowerCase()
  const id = control.id ? `#${control.id}` : ''
  const type = tagName === 'input' && control.type ? `[type="${control.type}"]` : ''
  const role = control.getAttribute('role')

  let state: CheckedState
  if (control.checked !== undefined && control.checked !== null) {
    state = control.checked ? 'checked' : 'unchecked'
  } else {
    const ariaChecked = control.getAttribute('aria-checked')
    state = ariaChecked === 'true' ? 'checked' : ariaChecked === 'mixed' ? 'mixed' : 'unchecked'
  }

  return { control: `${tagName}${id}${type}${role ? `[role="${role}"]` : ''}`, state }
}

export async function readCheckableControl(control: ElementHandle): Promise<ControlReading> {
  return await control.evaluate(readControl)
}

/**
 * Playwright's getByLabel rule, over checkboxes, radios and switches (native,
 * or by ARIA role): the text of their aria-labelledby elements, else their
 * aria-label, else their labels (a for label or a wrapping label), compared
 * case-insensitively with whitespace collapsed, as a substring. This runs in
 * the browser and must stay self-contained.
 */
function controlsLabelled(text: string): unknown[] {
  type Control = {
    tagName: string
    type?: string
    textContent: string | null
    labels?: ArrayLike<Control> | null
    getAttribute: (name: string) => string | null
  }
  const browserDocument = (
    globalThis as unknown as {
      document: {
        getElementById: (id: string) => Control | null
        querySelectorAll: (selector: string) => ArrayLike<Control>
      }
    }
  ).document

  const normalize = (value: string | null) =>
    String(value ?? '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  const wanted = normalize(text)

  const checkableRoles = ['checkbox', 'radio', 'switch', 'menuitemcheckbox', 'menuitemradio']
  const isCheckable = (element: Control) => {
    if (String(element.tagName).toLowerCase() === 'input') {
      return element.type === 'checkbox' || element.type === 'radio'
    }
    const role = (element.getAttribute('role') ?? '').trim().split(/\s+/)[0] ?? ''
    return checkableRoles.includes(role.toLowerCase())
  }

  // Playwright's getElementLabels: aria-labelledby elements replace every
  // other source, then a non-blank aria-label, then the element's labels.
  const labelTextsOf = (element: Control) => {
    const labelledBy = element.getAttribute('aria-labelledby')
    if (labelledBy !== null) {
      const labelledByElements = labelledBy
        .split(/\s+/)
        .filter(id => id)
        .map(id => browserDocument.getElementById(id))
        .filter((labelElement): labelElement is Control => !!labelElement)
      if (labelledByElements.length)
        return labelledByElements.map(labelElement => labelElement.textContent)
    }

    const ariaLabel = element.getAttribute('aria-label')
    if (ariaLabel !== null && ariaLabel.trim()) return [ariaLabel]

    return Array.from(element.labels ?? []).map(labelElement => labelElement.textContent)
  }

  return Array.from(browserDocument.querySelectorAll('*')).filter(
    element =>
      isCheckable(element) &&
      labelTextsOf(element).some(labelText => normalize(labelText).includes(wanted))
  )
}

type FallbackResult =
  | { resolved: true; control: ElementHandle; reading: ControlReading }
  | { resolved: false; reason: 'notFound' }
  | { resolved: false; reason: 'ambiguous'; matches: string[] }

/**
 * The fallback tier, once. A resolved result holds the control's handle, which
 * the caller disposes.
 */
async function findByAccessibleName(page: Page, text: string): Promise<FallbackResult> {
  const found = await page.evaluateHandle(controlsLabelled, String(text))
  try {
    const controls: ElementHandle[] = []
    for (const handle of (await found.getProperties()).values()) {
      const element = handle.asElement()
      if (element) controls.push(element as ElementHandle)
      else await handle.dispose()
    }

    if (controls.length === 1) {
      const control = controls[0]
      return { resolved: true, control, reading: await readCheckableControl(control) }
    }

    const matches: string[] = []
    for (const control of controls) {
      matches.push((await readCheckableControl(control)).control)
      await control.dispose()
    }
    return matches.length
      ? { resolved: false, reason: 'ambiguous', matches }
      : { resolved: false, reason: 'notFound' }
  } finally {
    await found.dispose()
  }
}

async function observeByAccessibleName(
  page: Page,
  text: string,
  labelTierOutcome: LabelTierOutcome
): Promise<CheckableObservation> {
  let fallback: FallbackResult
  try {
    fallback = await findByAccessibleName(page, text)
  } catch {
    // The page navigated or re-rendered mid-read; look again on the next poll.
    fallback = { resolved: false, reason: 'notFound' }
  }

  if (fallback.resolved) {
    await fallback.control.dispose()
    return { resolved: true, tier: 'fallback', ...fallback.reading }
  }
  if (fallback.reason === 'ambiguous') return fallback
  return labelTierOutcome
}

// Why today's lookup resolved nothing, when the fallback finds nothing either.
type LabelTierOutcome =
  | { resolved: false; reason: 'notFound' }
  | { resolved: false; reason: 'labelWithoutFor' }
  | { resolved: false; reason: 'invalidFor'; forValue: string }

type LabelTierControl =
  // control is null when { hidden: true } accepts an absent element
  { status: 'found'; control: ElementHandle | null } | { status: 'timeout' }

/**
 * Today's wait for the element a label's for attribute names:
 * page.waitForSelector('#' + for) with the caller's WaitForSelectorOptions
 * (visible, hidden, signal), for the given time. An unusable selector (see
 * unusableSelector) never resolves, so it waits out the time, as it always
 * has.
 */
async function waitForLabelTierControl(
  page: Page,
  selector: string,
  opts: WaitForSelectorOptions | undefined,
  timeLeft: number
): Promise<LabelTierControl> {
  try {
    const control = await page.waitForSelector(selector, {
      ...applyDefaultWaitForOpts(opts),
      // Puppeteer reads 0 as no limit.
      timeout: timeLeft === Infinity ? 0 : Math.max(1, timeLeft),
    })
    return { status: 'found', control }
  } catch {
    return { status: 'timeout' }
  }
}

/**
 * Whether the selector built from a label's for attribute can never match,
 * because it is not valid CSS: a React 18 id like ":r0:", or one starting with
 * a digit. Today's lookup waits out the timeout and fails on one, so the
 * fallback may look instead. Puppeteer must reject it and the page's
 * querySelector must too, so that a page navigating mid-check does not count.
 */
async function unusableSelector(page: Page, selector: string) {
  try {
    const element = await page.$(selector)
    await element?.dispose()
    return false
  } catch {
    try {
      return await page.evaluate(candidate => {
        try {
          ;(
            globalThis as unknown as { document: { querySelector: (selector: string) => unknown } }
          ).document.querySelector(candidate)
          return false
        } catch {
          return true
        }
      }, selector)
    } catch {
      return false
    }
  }
}

/**
 * The control a label's for attribute names as the page has it now, without
 * waiting: what waitForLabelTierControl resolves with when the selector
 * matches at once, with the visible and hidden options counted as
 * page.waitForSelector counts them (visible wins over hidden; with hidden, an
 * absent element is found as null). A timeout when nothing meets them.
 */
async function labelTierControlNow(
  page: Page,
  selector: string,
  opts: WaitForSelectorOptions | undefined
): Promise<LabelTierControl> {
  const wantVisible = opts?.visible ? true : opts?.hidden ? false : undefined
  let control: ElementHandle | null = null
  try {
    control = await page.$(selector)
    if (!control)
      return wantVisible === false ? { status: 'found', control: null } : { status: 'timeout' }
    if (
      wantVisible === undefined ||
      (wantVisible ? await control.isVisible() : await control.isHidden())
    ) {
      return { status: 'found', control }
    }
  } catch {
    // The page navigated or re-rendered mid-read.
  }
  await disposeQuietly(control)
  return { status: 'timeout' }
}

// How long a retry waits for a label-tier control it has already found, at
// least, so that a read near the timeout is not cut short by the round trip.
const labelTierRetryWait = 500

async function labelTierObservation(
  found: LabelTierControl,
  forValue: string
): Promise<CheckableObservation> {
  if (found.status === 'timeout' || !found.control) {
    return { resolved: false, reason: 'labelControlMissing', forValue }
  }

  try {
    return { resolved: true, tier: 'label', ...(await readCheckableControl(found.control)) }
  } catch {
    // The control was replaced mid-read; look again on the next poll.
    return { resolved: false, reason: 'labelControlMissing', forValue }
  } finally {
    await found.control.dispose()
  }
}

/**
 * The for attribute of the element toHaveChecked and toHaveUnchecked have
 * always read it from: the first element `label::-p-text` matches, which is
 * the label itself, or the child element holding the text. null when nothing
 * matches.
 */
async function assertionLabelFor(page: Page, text: string) {
  let match: ElementHandle | null
  try {
    match = await page.$(checkableLabelSelector(text))
  } catch {
    return null
  }
  if (!match) return null

  try {
    return {
      forValue: await match.evaluate(element =>
        (element as unknown as { getAttribute: (name: string) => string | null }).getAttribute(
          'for'
        )
      ),
    }
  } catch {
    return null
  } finally {
    await match.dispose()
  }
}

/**
 * A reader for toHaveChecked and toHaveUnchecked to call on each retry, until
 * the timeout. Each call returns the control's state, or why none resolved.
 *
 * Today's lookup comes first, unchanged, and decides whenever it names a
 * control: the first element `label::-p-text` matches; the selector
 * `'#' + its for attribute`, which is "#null" when it has none; and
 * page.waitForSelector on that selector with the caller's options, waiting up
 * to the timeout. Once a label's for attribute gives a usable selector, every
 * later read uses that selector, as the single read always did, even if
 * another label comes first later.
 *
 * Only when no label matches, when the match has no for attribute (and no
 * element has the id "null"), or when its for attribute is not valid CSS (see
 * unusableSelector), the fallback (Playwright's getByLabel rule) looks for the control.
 *
 * When the caller's signal has aborted, Puppeteer rejects the selector wait
 * without looking, so the control is read as the page has it then (see
 * labelTierControlNow): an abort reports the control's state, and reports it
 * missing only when it is.
 */
export function checkableControlReader(
  page: Page,
  text: string,
  opts?: WaitForSelectorOptions
): () => Promise<CheckableObservation> {
  const timeout = checkableControlTimeout(page, opts)
  const deadline = Date.now() + timeout
  let bound: { selector: string; forValue: string } | null = null
  let firstRead = true

  const labelTierControl = async (selector: string, timeLeft: number) => {
    const found = await waitForLabelTierControl(page, selector, opts, timeLeft)
    if (found.status === 'timeout' && opts?.signal?.aborted) {
      return await labelTierControlNow(page, selector, opts)
    }
    return found
  }

  return async () => {
    // A label found on the first read gets the whole timeout for its control,
    // as the single read always gave it.
    const timeLeft = firstRead ? timeout : deadline - Date.now()
    firstRead = false

    if (bound) {
      const found = await labelTierControl(
        bound.selector,
        Math.max(labelTierRetryWait, deadline - Date.now())
      )
      return await labelTierObservation(found, bound.forValue)
    }

    let outcome: LabelTierOutcome = { resolved: false, reason: 'notFound' }
    const label = await assertionLabelFor(page, text)
    if (label) {
      const { forValue } = label
      if (forValue === null && !(await elementExists(page, '#null'))) {
        outcome = { resolved: false, reason: 'labelWithoutFor' }
      } else if (forValue === '') {
        outcome = { resolved: false, reason: 'labelWithoutFor' }
      } else {
        const candidate = { selector: `#${forValue}`, forValue: String(forValue) }
        if (await unusableSelector(page, candidate.selector)) {
          outcome = { resolved: false, reason: 'invalidFor', forValue: candidate.forValue }
        } else {
          bound = candidate
          const found = await labelTierControl(candidate.selector, timeLeft)
          return await labelTierObservation(found, candidate.forValue)
        }
      }
    }

    return await observeByAccessibleName(page, text, outcome)
  }
}

// Ends the retry in retryCheckableState once the caller's signal has aborted.
class CheckableWaitAborted extends Error {
  constructor(public observation: CheckableObservation) {
    super('The wait for the checkable control was aborted')
  }
}

/**
 * toHaveChecked and toHaveUnchecked: read the control (see
 * checkableControlReader) until its state is the wanted one or the timeout
 * passes. When the caller's signal aborts, the wait ends with the failure for
 * the last observation instead of retrying, as the single read always ended
 * with its failure. A read the abort cut short (Puppeteer rejects the selector
 * wait) does not stand in for an earlier observation.
 */
export async function retryCheckableState(
  page: Page,
  text: string,
  opts: WaitForSelectorOptions | undefined,
  wanted: 'checked' | 'unchecked',
  texts: {
    successText: () => string
    failureText: (observation: CheckableObservation) => string
  }
): Promise<{ pass: boolean; message: () => string }> {
  const readControl = checkableControlReader(page, text, opts)
  const aborted = () => opts?.signal?.aborted === true
  let lastObservation: CheckableObservation | undefined

  try {
    return await evaluateWithRetryAndTimeout(
      page,
      async () => {
        if (lastObservation && aborted()) throw new CheckableWaitAborted(lastObservation)

        const observation = await readControl()
        const pass = observation.resolved && observation.state === wanted
        if (!pass && aborted()) throw new CheckableWaitAborted(lastObservation ?? observation)

        lastObservation = observation
        return { pass, actual: observation }
      },
      { ...texts, timeout: checkableControlTimeout(page, opts) }
    )
  } catch (error) {
    if (!(error instanceof CheckableWaitAborted)) throw error
    return { pass: false, message: () => texts.failureText(error.observation) }
  }
}

async function elementExists(page: Page, selector: string) {
  const element = await page.$(selector)
  await element?.dispose()
  return !!element
}

export type CheckableTarget =
  | {
      tier: 'label'
      // the selector today's lookup built from the label's for attribute
      selector: string
      // null when { hidden: true } accepted an absent element, as it always has
      control: ElementHandle | null
      // null when there is no control or it could not be read
      reading: ControlReading | null
    }
  | { tier: 'fallback'; control: ElementHandle; reading: ControlReading }

/**
 * Find the control toCheck or toUncheck acts on. The caller disposes the
 * control handle.
 *
 * Today's lookup comes first, unchanged, and decides whenever it names a
 * control: wait up to actionLabelWindow for `label::-p-text`, climb to the
 * label, read its for attribute, and page.waitForSelector('#' + for) with the
 * caller's options, waiting up to the timeout. A label whose for attribute
 * names no element still fails.
 *
 * Only when no label appears in that window, when the label has no for
 * attribute, or when its for attribute is not valid CSS (see unusableSelector),
 * the fallback
 * (Playwright's getByLabel rule) looks for the control until actionLabelWindow
 * or the timeout has passed, whichever is later.
 */
export async function findCheckableTarget(
  page: Page,
  text: string,
  opts?: WaitForSelectorOptions
): Promise<{ target: CheckableTarget } | { failure: CheckableObservation }> {
  const startTime = Date.now()
  const timeout = checkableControlTimeout(page, opts)
  let outcome: LabelTierOutcome = { resolved: false, reason: 'notFound' }

  let label: ElementHandle | null
  try {
    label = await page.waitForSelector(checkableLabelSelector(text), {
      timeout: actionLabelWindow,
    })
  } catch {
    label = null
  }

  if (label) {
    let forValue: string | null
    try {
      forValue = await label.evaluate(element => {
        const closestLabel = (
          element as unknown as {
            closest: (selector: string) => { getAttribute: (name: string) => string | null } | null
          }
        ).closest('label')
        return closestLabel ? closestLabel.getAttribute('for') : null
      })
    } finally {
      await label.dispose()
    }

    if (!forValue) {
      outcome = { resolved: false, reason: 'labelWithoutFor' }
    } else {
      const selector = `#${forValue}`
      if (await unusableSelector(page, selector)) {
        outcome = { resolved: false, reason: 'invalidFor', forValue }
      } else {
        const found = await waitForLabelTierControl(page, selector, opts, timeout)
        if (found.status === 'timeout') {
          return { failure: { resolved: false, reason: 'labelControlMissing', forValue } }
        }
        let reading: ControlReading | null
        try {
          reading = found.control ? await readCheckableControl(found.control) : null
        } catch {
          // Unreadable (the page navigated): toCheck clicks, as it always has;
          // toUncheck fails, as its read always did.
          reading = null
        }
        return { target: { tier: 'label', selector, control: found.control, reading } }
      }
    }
  }

  const deadline = startTime + Math.max(actionLabelWindow, timeout)
  for (;;) {
    let fallback: FallbackResult
    try {
      fallback = await findByAccessibleName(page, text)
    } catch {
      fallback = { resolved: false, reason: 'notFound' }
    }
    if (fallback.resolved) {
      return { target: { tier: 'fallback', control: fallback.control, reading: fallback.reading } }
    }

    if (Date.now() >= deadline) {
      return { failure: fallback.reason === 'ambiguous' ? fallback : outcome }
    }
    await sleep(pollInterval)
  }
}

/**
 * Click a control the fallback tier found, as toCheck and toUncheck always
 * have (ElementHandle#click). When it cannot be clicked yet (it was replaced
 * by a re-render, or has no point on screen), it is found again by its
 * accessible name and the click retried until the timeout; a click that
 * reached the page is never retried. See clickBeforeTimeout. The control
 * handle is disposed.
 */
export async function clickFallbackControl(
  page: Page,
  text: string,
  control: ElementHandle,
  opts?: WaitForSelectorOptions
): Promise<ClickOutcome> {
  return (await clickFallback(page, text, control, opts, false)).outcome
}

/**
 * clickFallbackControl for toUncheck, which reads the control it clicked
 * afterwards: clicked is a handle to the element the click reached (the one
 * found again when a retry found another), null when nothing was clicked. The
 * caller disposes it.
 */
export async function clickFallbackControlAndKeepIt(
  page: Page,
  text: string,
  control: ElementHandle,
  opts?: WaitForSelectorOptions
): Promise<{ outcome: ClickOutcome; clicked: ElementHandle | null }> {
  return await clickFallback(page, text, control, opts, true)
}

async function clickFallback(
  page: Page,
  text: string,
  control: ElementHandle,
  opts: WaitForSelectorOptions | undefined,
  keepClicked: boolean
): Promise<{ outcome: ClickOutcome; clicked: ElementHandle | null }> {
  // clickBeforeTimeout disposes each element it aims at, so a second handle
  // to the latest one is kept.
  let latest: ElementHandle | null = null
  const keep = async (element: ElementHandle) => {
    if (!keepClicked) return element
    let kept: ElementHandle | null
    try {
      const handle: JSHandle = await element.evaluateHandle((node: unknown) => node)
      kept = handle.asElement() as ElementHandle | null
    } catch (error) {
      // Detached already: clickBeforeTimeout finds it again.
      await disposeQuietly(element)
      throw error
    }
    await disposeQuietly(latest)
    latest = kept
    return element
  }

  let firstAttempt = true
  const outcome = await clickBeforeTimeout(
    async () => {
      if (firstAttempt) {
        firstAttempt = false
        return await keep(control)
      }

      const found = await findByAccessibleName(page, text)
      if (found.resolved) return await keep(found.control)
      throw new Error(unresolvedCheckableControl(found, text))
    },
    { timeout: checkableControlTimeout(page, opts), signal: opts?.signal }
  )

  if (outcome.clicked) return { outcome, clicked: latest }
  await disposeQuietly(latest)
  return { outcome, clicked: null }
}

async function disposeQuietly(handle: ElementHandle | null) {
  try {
    await handle?.dispose()
  } catch {
    // The page navigated away; nothing is left to release.
  }
}

/**
 * After toUncheck clicks: the control's reading now; null when it is gone
 * (which has always counted as unchecked); undefined when it could not be read
 * this time (the page re-rendered mid-read, or the page the click navigated to
 * is still loading); ambiguous when the control left
 * the page and more than one control now has its name.
 *
 * A label-tier control is looked up by today's selector again. A fallback
 * control is the one the click reached (clicked), read while it is on the
 * page, even when another control takes its name or its own name changes.
 * Only once it has left the page (a re-render may have replaced it, or the
 * click navigated and its handle is dead) is it
 * found again by its accessible name, and only when nothing has that name is
 * it gone.
 */
export async function readCheckableTargetAgain(
  page: Page,
  text: string,
  target: CheckableTarget,
  clicked: ElementHandle | null
): Promise<
  ControlReading | null | undefined | { resolved: false; reason: 'ambiguous'; matches: string[] }
> {
  try {
    if (target.tier === 'label') {
      const control = await page.$(target.selector)
      if (!control) return null
      try {
        return await readCheckableControl(control)
      } finally {
        await control.dispose()
      }
    }

    let connected = false
    try {
      connected =
        !!clicked &&
        (await clicked.evaluate(node => (node as unknown as { isConnected: boolean }).isConnected))
    } catch {
      // A navigation destroyed the handle's document: the control left the page.
    }
    if (clicked && connected) return await readCheckableControl(clicked)

    // The page the click navigated to has not been parsed yet, so the control
    // may still arrive; read it again on the next poll.
    if (
      await page.evaluate(
        () =>
          (globalThis as unknown as { document: { readyState: string } }).document.readyState ===
          'loading'
      )
    ) {
      return undefined
    }

    const fallback = await findByAccessibleName(page, text)
    if (fallback.resolved) {
      await fallback.control.dispose()
      return fallback.reading
    }
    return fallback.reason === 'ambiguous' ? fallback : null
  } catch {
    return undefined
  }
}

/**
 * Why the text resolved no control, or undefined when it did.
 */
export function unresolvedCheckableControl(
  observation: CheckableObservation,
  text: string
): string | undefined {
  if (observation.resolved) return undefined

  switch (observation.reason) {
    case 'labelControlMissing':
      return `The first label containing "${text}" has for="${observation.forValue}", but no element has that id`
    case 'labelWithoutFor':
      return `The first label containing "${text}" has no for attribute, and no checkbox, radio or switch is labelled "${text}"`
    case 'invalidFor':
      return `The first label containing "${text}" has for="${observation.forValue}", which is not usable as a CSS id selector, and no checkbox, radio or switch is labelled "${text}"`
    case 'ambiguous':
      return `${observation.matches.length} controls are labelled "${text}": ${observation.matches.join(', ')}. Use more of the label text to pick one`
    case 'notFound':
      return `No label contains "${text}", and no checkbox, radio or switch is labelled "${text}" by a label, aria-labelledby or aria-label`
  }
}

/**
 * The failure toCheck and toUncheck report when the text resolved no control:
 * the messages they have always given for a label without a for attribute and
 * for a for attribute that names no usable element, otherwise why nothing was
 * found.
 */
export function checkableActionFailure(failure: CheckableObservation, text: string) {
  if (failure.resolved) throw new Error('checkableActionFailure called with a resolved control')

  switch (failure.reason) {
    case 'labelWithoutFor':
      return { pass: false, message: () => emptyForAttribute() }
    case 'labelControlMissing':
    case 'invalidFor':
      return { pass: false, message: () => missingInputToMatchForAttribute(failure.forValue) }
    default:
      return {
        pass: false,
        message: () =>
          `Expected page to have checkable element with text: "${text}". ${unresolvedCheckableControl(failure, text)}`,
      }
  }
}
