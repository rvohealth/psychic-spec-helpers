import { Page } from 'puppeteer'

export type SelectState =
  | { found: false }
  | { found: true; optionValues: string[]; selectedValues: string[] }

/**
 * Read the option values of the first select matching cssSelector, and which of
 * them are selected. Values (an option's value attribute, or else its text)
 * match what toSelect takes, so a spec can pass an enum value rather than its
 * translated label.
 */
export default async function getSelectState(page: Page, cssSelector: string) {
  return await page.evaluate((selector): SelectState => {
    type Option = { value: string; selected: boolean }
    // The callback is type-checked against the Node lib; document exists at runtime.
    const browserDocument = (
      globalThis as unknown as {
        document: {
          querySelector: (
            selector: string
          ) => { tagName: string; options?: ArrayLike<Option> } | null
        }
      }
    ).document

    const select = browserDocument.querySelector(selector)
    if (!select || select.tagName.toLowerCase() !== 'select' || !select.options) {
      return { found: false }
    }

    const options = Array.from(select.options)
    return {
      found: true,
      optionValues: options.map(option => option.value),
      selectedValues: options.filter(option => option.selected).map(option => option.value),
    }
  }, cssSelector)
}

/**
 * The failure shared by toHaveSelected and toHaveUnselected when the select or
 * the option is missing, or undefined when both exist.
 */
export function missingSelectOrOption(
  state: SelectState,
  cssSelector: string,
  optionValue: string
): string | undefined {
  if (!state.found) {
    return `Expected page to have a select matching "${cssSelector}", but none was found`
  }

  if (!state.optionValues.includes(optionValue)) {
    return `Expected the "${cssSelector}" select to have an option with value "${optionValue}", but its option values are: ${state.optionValues.map(value => `"${value}"`).join(', ')}`
  }

  return undefined
}
