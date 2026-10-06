import { Page } from 'puppeteer'

/** Collect rendered text and displayed control values, excluding CSS-hidden content. */
export default async function getAllTextContentFromPage(page: Page, selector = 'body') {
  const allText = await page.evaluate(selector => {
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

    const contributesText = (element: TextElement) =>
      hasRenderedAncestry(element) && styleFor(element).visibility !== 'hidden'

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

    const hiddenOptions = (element: TextElement) =>
      Array.from(element.querySelectorAll('option')).some(option => !contributesText(option))

    // Chrome's innerText includes CSS-hidden option labels in select/ancestor
    // aggregates. Recompose only those paths; unaffected subtrees keep native
    // innerText, including their formatting and explicitly restored visibility.
    const renderedText = (element: TextElement): string => {
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
      let text = ''
      const append = (fragment: string, lineBreaks = 0, preservesFragmentSpaces = false) => {
        if (!fragment) return
        if (lineBreaks) {
          const trailingBreaks = text.match(/\n*$/)?.[0].length || 0
          text += '\n'.repeat(Math.max(0, lineBreaks - trailingBreaks))
        } else if (!preservesSpaces && !preservesFragmentSpaces && /[ \t\n]$/.test(text)) {
          fragment = fragment.replace(/^[ \t]+/, '')
        }
        text += fragment
        if (lineBreaks) text += '\n'.repeat(lineBreaks)
      }

      const nodes = Array.from(element.childNodes)
      nodes.forEach((node, index) => {
        if (node.nodeType === 3 && contributesText(element)) {
          let fragment = node.textContent || ''
          if (!preservesSpaces) {
            fragment =
              style.whiteSpace === 'pre-line'
                ? fragment.replace(/[ \t\f\r]+/g, ' ')
                : fragment.replace(/[ \t\f\r\n]+/g, ' ')
          }
          if (!preservesSpaces) {
            // Discard only collapsed text-node padding at rendered block edges;
            // spaces contributed by preformatted descendants remain meaningful.
            if ((isBlock(element) && !text) || text.endsWith('\n')) {
              fragment = fragment.replace(/^[ \t]+/, '')
            }
            // Only a fragment that composition will append can define a block edge.
            // Whitespace-only preformatted siblings still contribute their spaces.
            const next = nodes
              .slice(index + 1)
              .find(sibling =>
                sibling.nodeType === 3
                  ? contributesText(element) && /[^ \t\f\r\n]/.test(sibling.textContent || '')
                  : sibling.nodeType === 1 && !!renderedText(sibling as TextElement)
              )
            if (
              (!next && isBlock(element)) ||
              (next?.nodeType === 1 && isBlock(next as TextElement))
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
                segment.isWordLike && !(segment.index === 0 && /[\p{L}\p{N}\p{M}]$/u.test(text))
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
          const childStyle = styleFor(child)
          const block = separatesItems || isBlock(child)
          append(
            renderedText(child),
            block ? (child.tagName.toLowerCase() === 'p' ? 2 : 1) : 0,
            ['pre', 'pre-wrap', 'break-spaces'].includes(childStyle.whiteSpace)
          )
        }
      })
      // Inline fragments retain boundary spaces until their ancestor is composed.
      // Normal block padding is removed from its own text nodes above.
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
  }, selector)

  return allText
}
