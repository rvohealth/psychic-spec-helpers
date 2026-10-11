import { Page } from 'puppeteer'

/**
 * `window` property caching the hidden-option probe's result for a document:
 * `true` where the browser's `innerText` includes CSS-hidden option labels
 * (Chrome), `false` where it excludes them (Firefox). Internal; exposed for specs.
 */
export const HIDDEN_OPTION_LEAK_CACHE_KEY =
  '__psychicSpecHelpersInnerTextIncludesHiddenOptionLabels'

/** Label of the probe's hidden option. The probe is removed before any text is collected. */
export const HIDDEN_OPTION_PROBE_LABEL = 'psychic-spec-helpers hidden option probe'

/**
 * Collect rendered text and displayed control values, excluding CSS-hidden content.
 *
 * Text is the browser's native `innerText` throughout, except in a browser
 * whose `innerText` includes CSS-hidden option labels (Chrome): there, each
 * select or ancestor containing a hidden option is recomposed by hand to drop
 * those labels. A probe run once per document decides which case applies, so
 * other browsers (Firefox, the default) never recompose.
 */
export default async function getAllTextContentFromPage(page: Page, selector = 'body') {
  const evaluateArgs = {
    selector,
    probeLabel: HIDDEN_OPTION_PROBE_LABEL,
    cacheKey: HIDDEN_OPTION_LEAK_CACHE_KEY,
  }
  const allText = await page.evaluate(({ selector, probeLabel, cacheKey }) => {
    type TextNode = {
      nodeType: number
      textContent: string | null
      childNodes: ArrayLike<TextNode>
    }
    type TextElement = TextNode & {
      tagName: string
      parentElement: TextElement | null
      querySelectorAll: (selector: string) => ArrayLike<TextElement>
      innerText?: string
      value?: string
      type?: string
      getAttribute: (name: string) => string | null
    }

    const styleFor = (element: TextElement) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Browser globals are available inside page.evaluate.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return getComputedStyle(element) as {
        display: string
        visibility: string
        whiteSpace: string
        textTransform: string
      }
    }

    const hasRenderedAncestry = (element: TextElement) => {
      // Unlike visibility, display:none cannot be restored by a descendant.
      for (
        let ancestor: TextElement | null = element;
        ancestor;
        ancestor = ancestor.parentElement
      ) {
        if (styleFor(ancestor).display === 'none') return false
      }
      return !(element.tagName.toLowerCase() === 'input' && element.type === 'hidden')
    }

    // visibility: collapse hides text like hidden (and removes table rows).
    const contributesText = (element: TextElement) =>
      hasRenderedAncestry(element) && !['hidden', 'collapse'].includes(styleFor(element).visibility)

    // Non-HTML elements (e.g. SVG) lack innerText. Filter their text nodes
    // through the same rule so ancestor textContent cannot re-add hidden text.
    const displayedTextContent = (element: TextElement): string => {
      if (['script', 'style', 'noscript'].includes(element.tagName.toLowerCase())) return ''
      return Array.from(element.childNodes)
        .map(node => {
          if (node.nodeType === 3) return contributesText(element) ? node.textContent || '' : ''
          if (node.nodeType === 1) return displayedTextContent(node as TextElement)
          return ''
        })
        .join('')
    }

    type ProbeElement = TextElement & {
      setAttribute: (name: string, value: string) => void
      append: (...nodes: ProbeElement[]) => void
      remove: () => void
    }
    // The callback is type-checked against the Node lib; these browser globals
    // exist at runtime (same idiom as resetBrowserState). window is globalThis.
    const browserGlobals = globalThis as unknown as {
      document: { body: ProbeElement | null; createElement: (tagName: string) => ProbeElement }
      window: Record<string, unknown>
    }

    // Chrome's innerText includes CSS-hidden option labels in select and
    // ancestor aggregates; Firefox's excludes them. Probe once per document
    // with an offscreen but rendered select (a display:none select's innerText
    // falls back to textContent, which always includes the label) holding a
    // hidden option, and remove it before any text is collected.
    const innerTextIncludesHiddenOptionLabels = (): boolean => {
      const cached = browserGlobals.window[cacheKey]
      if (typeof cached === 'boolean') return cached
      const body = browserGlobals.document.body
      // No body yet: recomposition is correct in every browser, so assume the
      // labels leak and probe again on the next evaluate.
      if (!body) return true
      const select = browserGlobals.document.createElement('select')
      select.setAttribute('style', 'position:absolute;left:-10000px;top:-10000px')
      const hiddenOption = browserGlobals.document.createElement('option')
      hiddenOption.setAttribute('style', 'display:none')
      hiddenOption.textContent = probeLabel
      const shownOption = browserGlobals.document.createElement('option')
      shownOption.textContent = 'shown'
      select.append(hiddenOption, shownOption)
      body.append(select)
      let innerText: string | undefined
      try {
        innerText = select.innerText
      } finally {
        select.remove()
      }
      const includesHiddenLabel = typeof innerText !== 'string' || innerText.includes(probeLabel)
      browserGlobals.window[cacheKey] = includesHiddenLabel
      return includesHiddenLabel
    }
    const recomposesHiddenOptions = innerTextIncludesHiddenOptionLabels()

    // Only where the browser's innerText includes hidden option labels does an
    // element containing one need recomposition; elsewhere native innerText
    // already excludes them.
    const hiddenOptions = (element: TextElement) =>
      recomposesHiddenOptions &&
      Array.from(element.querySelectorAll('option')).some(option => !contributesText(option))

    // Required line break counts dropped at the edges of the most recent
    // recomposed text; native innerText already drops its own.
    let edgeLineBreaks = { leading: 0, trailing: 0 }

    // Where innerText includes CSS-hidden option labels (Chrome), recompose
    // only the select/ancestor aggregates containing one; every other element,
    // and every element in other browsers (Firefox), keeps native innerText,
    // including its formatting and explicitly restored visibility.
    const renderedText = (element: TextElement): string => {
      edgeLineBreaks = { leading: 0, trailing: 0 }
      const tagName = element.tagName.toLowerCase()
      if (!hasRenderedAncestry(element)) return ''
      if (['script', 'style', 'noscript'].includes(tagName)) return ''
      if (tagName === 'option' && !contributesText(element)) return ''
      if (tagName === 'br') return '\n'
      if (!hiddenOptions(element)) {
        return typeof element.innerText === 'string'
          ? element.innerText
          : displayedTextContent(element)
      }
      if (tagName === 'select') {
        return Array.from(element.querySelectorAll('option'))
          .filter(contributesText)
          .map(option => option.innerText ?? displayedTextContent(option))
          .join('\n')
      }

      const style = styleFor(element)
      let language: string | undefined
      for (
        let ancestor: TextElement | null = element;
        ancestor;
        ancestor = ancestor.parentElement
      ) {
        const declaredLanguage = ancestor.getAttribute('lang')
        if (declaredLanguage !== null) {
          // CSS casing has language-specific rules for these locales.
          language = /^(az|el|lt|tr)(?:-|$)/i.exec(declaredLanguage)?.[1]?.toLowerCase()
          break
        }
      }
      const preservesSpaces = ['pre', 'pre-wrap', 'break-spaces'].includes(style.whiteSpace)
      const separatesItems = ['flex', 'inline-flex', 'grid', 'inline-grid'].includes(style.display)
      const isBlock = (element: TextElement) =>
        element.tagName.toLowerCase() === 'select' ||
        !['inline', 'inline-block', 'inline-flex', 'inline-grid', 'contents', 'none'].includes(
          styleFor(element).display
        )
      // A rendered, visible block child separates its neighbors even when it
      // renders no text; invisible boxes contribute neither text nor breaks.
      const separates = (child: TextElement) =>
        hasRenderedAncestry(child) &&
        styleFor(child).visibility === 'visible' &&
        (separatesItems || isBlock(child))
      let text = ''
      // innerText's required line break counts: adjacent counts merge into the
      // larger one, counts at either edge of the composed text are dropped, and
      // a count is only emitted once a later fragment renders. The dropped edge
      // counts are reported so a recomposed ancestor can merge them.
      let pendingLineBreaks = 0
      let leadingLineBreaks = 0
      const append = (
        fragment: string,
        before = 0,
        after = before,
        preservesFragmentSpaces = false
      ) => {
        pendingLineBreaks = Math.max(pendingLineBreaks, before)
        if (!fragment) {
          pendingLineBreaks = Math.max(pendingLineBreaks, after)
          return
        }
        const collapsible = !preservesSpaces && !preservesFragmentSpaces
        if (pendingLineBreaks) {
          if (text) text += '\n'.repeat(pendingLineBreaks)
          else leadingLineBreaks = pendingLineBreaks
          // An inline fragment starts a line here. Block fragments already shed
          // their own edge padding, keeping preformatted descendant spaces.
          if (collapsible && !before) fragment = fragment.replace(/^[ \t]+/, '')
        } else if (collapsible && /[ \t\n]$/.test(text)) {
          fragment = fragment.replace(/^[ \t]+/, '')
        }
        text += fragment
        pendingLineBreaks = after
      }

      const nodes = Array.from(element.childNodes)
      nodes.forEach((node, index) => {
        if (node.nodeType === 3 && contributesText(element)) {
          let fragment = node.textContent || ''
          if (!preservesSpaces) {
            fragment =
              style.whiteSpace === 'pre-line'
                ? // pre-line keeps segment breaks but removes the collapsible
                  // spaces around them.
                  fragment.replace(/[ \t\f\r]+/g, ' ').replace(/ ?\n ?/g, '\n')
                : fragment.replace(/[ \t\f\r\n]+/g, ' ')
          }
          if (!preservesSpaces) {
            // Discard only collapsed text-node padding at rendered block edges;
            // spaces contributed by preformatted descendants remain meaningful.
            if ((isBlock(element) && !text) || pendingLineBreaks > 0 || text.endsWith('\n')) {
              fragment = fragment.replace(/^[ \t]+/, '')
            }
            // Only a sibling that separates or that composition will append can
            // define a block edge. Whitespace-only preformatted siblings still
            // contribute their spaces.
            const next = nodes
              .slice(index + 1)
              .find(sibling =>
                sibling.nodeType === 3
                  ? contributesText(element) && /[^ \t\f\r\n]/.test(sibling.textContent || '')
                  : sibling.nodeType === 1 &&
                    (separates(sibling as TextElement) || !!renderedText(sibling as TextElement))
              )
            if (
              (!next && isBlock(element)) ||
              (next?.nodeType === 1 && separates(next as TextElement))
            ) {
              fragment = fragment.replace(/[ \t]+$/, '')
            }
          }
          if (style.textTransform === 'uppercase') fragment = fragment.toLocaleUpperCase(language)
          if (style.textTransform === 'lowercase') fragment = fragment.toLocaleLowerCase(language)
          if (style.textTransform === 'capitalize') {
            fragment = Array.from(
              new Intl.Segmenter(language, { granularity: 'word' }).segment(fragment)
            )
              .map(segment =>
                segment.isWordLike &&
                !(
                  segment.index === 0 &&
                  pendingLineBreaks === 0 &&
                  /[\p{L}\p{N}\p{M}]$/u.test(text)
                )
                  ? segment.segment.replace(/\p{L}/u, letter => letter.toLocaleUpperCase(language))
                  : segment.segment
              )
              .join('')
          }
          if (
            style.textTransform === 'math-auto' &&
            Array.from(node.textContent || '').length === 1
          ) {
            // MathML Core C.1: math-auto transforms single-character text nodes.
            const plain =
              'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzıȷΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡϴΣΤΥΦΧΨΩ∇αβγδεζηθικλμνξοπρςστυφχψω∂ϵϑϰϕϱϖ'
            const italic = Array.from(
              '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧𝚤𝚥𝛢𝛣𝛤𝛥𝛦𝛧𝛨𝛩𝛪𝛫𝛬𝛭𝛮𝛯𝛰𝛱𝛲𝛳𝛴𝛵𝛶𝛷𝛸𝛹𝛺𝛻𝛼𝛽𝛾𝛿𝜀𝜁𝜂𝜃𝜄𝜅𝜆𝜇𝜈𝜉𝜊𝜋𝜌𝜍𝜎𝜏𝜐𝜑𝜒𝜓𝜔𝜕𝜖𝜗𝜘𝜙𝜚𝜛'
            )
            const index = plain.indexOf(node.textContent || '')
            if (index >= 0) fragment = italic[index] || fragment
          }
          append(fragment, separatesItems ? 1 : 0)
        } else if (node.nodeType === 1) {
          const child = node as TextElement
          if (!hasRenderedAncestry(child)) return
          const childText = renderedText(child)
          const childEdges = edgeLineBreaks
          const lineBreaks = separates(child) ? (child.tagName.toLowerCase() === 'p' ? 2 : 1) : 0
          append(
            childText,
            Math.max(lineBreaks, childEdges.leading),
            Math.max(lineBreaks, childEdges.trailing),
            ['pre', 'pre-wrap', 'break-spaces'].includes(styleFor(child).whiteSpace)
          )
        }
      })
      // Inline fragments retain boundary spaces until their ancestor is composed.
      // Normal block padding is removed from its own text nodes above.
      edgeLineBreaks = { leading: leadingLineBreaks, trailing: pendingLineBreaks }
      return text
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    const roots: TextElement[] = Array.from(document.querySelectorAll(selector))

    const textContentArray: string[] = []

    roots.forEach(root => {
      const elements = [root, ...Array.from(root.querySelectorAll('*'))]

      elements.forEach(element => {
        const tagName = String(element.tagName || '').toLowerCase()
        if (['script', 'style', 'noscript'].includes(tagName)) return
        if (!hasRenderedAncestry(element)) return
        const isDisplayed = contributesText(element)
        if (['input', 'textarea', 'option'].includes(tagName) && !isDisplayed) return

        // Form-control values (input/textarea) are not part of innerText or
        // textContent, but the previous ::-p-text()-based matcher matched them
        // and callers assert on entered values, so include displayed controls
        // explicitly. Hidden controls follow the same exclusion as other text.
        if (isDisplayed && (tagName === 'input' || tagName === 'textarea')) {
          const value = element.value?.trim()
          if (value) textContentArray.push(value)
        }

        // Hidden HTML containers retain native innerText for restored descendants;
        // aggregates containing hidden options use the same eligibility rule.
        const normalizedText = renderedText(element).trim()
        if (normalizedText) textContentArray.push(normalizedText)
      })
    })

    return textContentArray.join(' ')
  }, evaluateArgs)

  return allText
}
