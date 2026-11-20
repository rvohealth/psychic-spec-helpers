import { Page } from 'puppeteer'

/** The parts of an element the visibility rules read. */
export type RulesElement = {
  tagName: string
  type?: string
  parentElement: RulesElement | null
}

/**
 * Feature specs are user stories, so the matchers that read what a page shows
 * count only what a user can see without inspecting the page (see "Feature
 * Spec Matchers Describe What a User Sees" in AGENTS.md). These are the rules,
 * shared by the text matchers (getAllTextContentFromPage) and the value
 * matchers (getFieldValue) so that the two agree on every field.
 *
 * This runs in the browser. page.evaluate sends a function to the page as its
 * source text, so it must not use anything from outside its own body;
 * evaluateWithVisibilityRules hands its result to the page function.
 */
export function visibilityRules() {
  const styleFor = (element: RulesElement) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Browser globals are available inside page.evaluate.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return getComputedStyle(element) as { display: string; visibility: string }
  }

  // innerText falls back to textContent, hidden text included, for an
  // element that is not rendered, so skip anything under display: none.
  // Rendered elements' innerText already leaves out visibility-hidden text.
  const isRendered = (element: RulesElement) => {
    for (let ancestor: RulesElement | null = element; ancestor; ancestor = ancestor.parentElement) {
      if (styleFor(ancestor).display === 'none') return false
    }
    return true
  }

  const isVisible = (element: RulesElement) =>
    isRendered(element) && styleFor(element).visibility === 'visible'

  // A form field shows its value when it is visible and is not an
  // input[type=hidden], which never shows one.
  const isVisibleField = (element: RulesElement) =>
    !(String(element.tagName).toLowerCase() === 'input' && element.type === 'hidden') &&
    isVisible(element)

  return { isRendered, isVisible, isVisibleField }
}

export type VisibilityRules = ReturnType<typeof visibilityRules>

/**
 * Run pageFunction in the page with the visibility rules and one
 * JSON-serializable argument. pageFunction must be self-contained, like any
 * function passed to page.evaluate.
 */
export default async function evaluateWithVisibilityRules<Argument, Result>(
  page: Page,
  pageFunction: (rules: VisibilityRules, argument: Argument) => Result,
  argument: Argument
): Promise<Awaited<Result>> {
  return (await page.evaluate(
    `(${pageFunction.toString()})((${visibilityRules.toString()})(), ${JSON.stringify(argument)})`
  )) as Awaited<Result>
}
