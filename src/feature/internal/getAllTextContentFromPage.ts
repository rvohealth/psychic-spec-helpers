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
    }

    const styleFor = (element: TextElement) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Browser globals are available inside page.evaluate.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return getComputedStyle(element) as { display: string; visibility: string }
    }

    const contributesText = (element: TextElement) => {
      if (styleFor(element).visibility === 'hidden') return false
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
        if (!contributesText(element)) return

        // Form-control values (input/textarea) are not part of innerText or
        // textContent, but the previous ::-p-text()-based matcher matched them
        // and callers assert on entered values, so include displayed controls
        // explicitly. Hidden controls follow the same exclusion as other text.
        if (tagName === 'input' || tagName === 'textarea') {
          const value = element.value?.trim()
          if (value) textContentArray.push(value)
        }

        let elementText: string | null | undefined
        if (typeof element.innerText === 'string') {
          elementText = element.innerText
        } else {
          elementText = displayedTextContent(element)
        }

        const normalizedText = elementText?.trim()
        if (normalizedText) textContentArray.push(normalizedText)
      })
    })

    return textContentArray.join(' ')
  }, selector)

  return allText
}
