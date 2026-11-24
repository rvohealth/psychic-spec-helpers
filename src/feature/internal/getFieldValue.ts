import { Page } from 'puppeteer'
import evaluateWithVisibilityRules, { VisibilityRules } from './visibilityRules.js'

export type FieldValueState = { found: false; matched: number } | { found: true; value: string }

/**
 * Read the value property of the first input, textarea or select matching
 * cssSelector that a user can see, by the rule the text matchers apply to
 * field values (see visibilityRules). The property, not the value attribute,
 * holds what the field shows once a user or a script changes it. A select's
 * value is its first selected option's value. matched counts every element
 * the selector matched, for the failure text.
 */
export default async function getFieldValue(page: Page, cssSelector: string) {
  return await evaluateWithVisibilityRules(page, readFieldValue, cssSelector)
}

function readFieldValue({ isVisibleField }: VisibilityRules, selector: string): FieldValueState {
  type Field = {
    tagName: string
    type?: string
    value?: string
    parentElement: Field | null
  }
  const browserDocument = (
    globalThis as unknown as {
      document: { querySelectorAll: (selector: string) => ArrayLike<Field> }
    }
  ).document

  const matches = Array.from(browserDocument.querySelectorAll(selector))
  const field = matches.find(
    element =>
      ['input', 'textarea', 'select'].includes(String(element.tagName).toLowerCase()) &&
      isVisibleField(element)
  )
  if (!field) return { found: false, matched: matches.length }

  return { found: true, value: field.value ?? '' }
}

/** Whether a field's value matches what a value matcher expects. */
export function fieldValueMatches(value: string, expected: string | RegExp) {
  if (typeof expected === 'string') return value === expected

  expected.lastIndex = 0
  return expected.test(value)
}

/** How the value matchers' failure text shows an expected or actual value. */
export function describeFieldValue(value: string | RegExp) {
  return typeof value === 'string' ? JSON.stringify(value) : value.toString()
}

/**
 * The failure shared by toHaveValue and toNotHaveValue when no visible field
 * matches the selector, or undefined when one does.
 */
export function missingField(state: FieldValueState, cssSelector: string): string | undefined {
  if (state.found) return undefined

  const fieldThatAUserCanSee = `an input, textarea or select matching "${cssSelector}" that a user can see`
  if (state.matched === 0) {
    return `Expected page to have ${fieldThatAUserCanSee}, but nothing matches that selector`
  }

  return `Expected page to have ${fieldThatAUserCanSee}, but the ${
    state.matched === 1 ? 'element' : `${state.matched} elements`
  } matching it ${state.matched === 1 ? 'is' : 'are'} hidden or not an input, textarea or select`
}
