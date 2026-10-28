import { Page } from 'puppeteer'

export type SelectState =
  | { found: false }
  | { found: true; optionLabels: string[]; selectedLabels: string[] }

/**
 * Read the option labels of the first select matching cssSelector, and which of
 * them are selected. Labels are what the user sees in the menu (an option's
 * label attribute, or else its text), not option values.
 */
export default async function getSelectState(page: Page, cssSelector: string) {
  return await page.evaluate((selector): SelectState => {
    type Option = { label: string; selected: boolean }
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
      optionLabels: options.map(option => option.label),
      selectedLabels: options.filter(option => option.selected).map(option => option.label),
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
  optionLabel: string
): string | undefined {
  if (!state.found) {
    return `Expected page to have a select matching "${cssSelector}", but none was found`
  }

  if (!state.optionLabels.includes(optionLabel)) {
    return `Expected the "${cssSelector}" select to have an option labeled "${optionLabel}", but its options are: ${state.optionLabels.map(label => `"${label}"`).join(', ')}`
  }

  return undefined
}
