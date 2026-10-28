import { Page } from 'puppeteer'

/**
 * Collect rendered text and displayed control values, excluding content hidden
 * by `display: none` (on the element or an ancestor), `visibility: hidden` or
 * `collapse`, and `input[type=hidden]` values. Text is the browser's native
 * innerText.
 */
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

    // innerText falls back to textContent, hidden text included, for an
    // element that is not rendered, so skip anything under display: none.
    // Rendered elements' innerText already leaves out visibility-hidden text.
    const isRendered = (element: TextElement) => {
      for (
        let ancestor: TextElement | null = element;
        ancestor;
        ancestor = ancestor.parentElement
      ) {
        if (styleFor(ancestor).display === 'none') return false
      }
      return true
    }
    const isVisible = (element: TextElement) =>
      isRendered(element) && styleFor(element).visibility === 'visible'

    // Non-HTML elements (e.g. SVG) have no innerText; filter their textContent
    // by the same rules.
    const visibleTextContent = (element: TextElement): string =>
      Array.from(element.childNodes)
        .map(node => {
          if (node.nodeType === 3) return isVisible(element) ? node.textContent || '' : ''
          if (node.nodeType === 1) return visibleTextContent(node as TextElement)
          return ''
        })
        .join('')

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
        if (!isRendered(element)) return

        // Form-control values (input/textarea) are not part of innerText or
        // textContent, but the previous ::-p-text()-based matcher matched them
        // and callers assert on entered values, so include visible ones explicitly.
        const isControl =
          (tagName === 'input' && element.type !== 'hidden') || tagName === 'textarea'
        if (isControl && isVisible(element)) {
          const value = element.value?.trim()
          if (value) textContentArray.push(value)
        }

        const elementText =
          typeof element.innerText === 'string' ? element.innerText : visibleTextContent(element)
        const normalizedText = elementText?.trim()
        if (normalizedText) textContentArray.push(normalizedText)
      })
    })

    return textContentArray.join(' ')
  }, selector)

  return allText
}
