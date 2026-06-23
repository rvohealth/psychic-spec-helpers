import { Page } from 'puppeteer'

export default async function getAllTextContentFromPage(page: Page, selector = 'body') {
  // Evaluate and extract all text content on the page
  const allText = await page.evaluate(selector => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    const roots = Array.from(document.querySelectorAll(selector))

    const textContentArray: string[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(roots as any[]).forEach(root => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      const elements = [root, ...Array.from(root.querySelectorAll('*'))]

      elements.forEach(element => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const tagName = String(element.tagName || '').toLowerCase()
        if (['script', 'style', 'noscript'].includes(tagName)) return

        // Form-control values (input/textarea) are not part of innerText or
        // textContent, but the previous ::-p-text()-based matcher matched them
        // and callers assert on entered values, so include them explicitly.
        if (tagName === 'input' || tagName === 'textarea') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          const value = element.value?.trim()
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          if (value) textContentArray.push(value)
        }

        let elementText: string | undefined
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (typeof element.innerText === 'string') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          elementText = element.innerText
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          elementText = element.textContent
        }

        const normalizedText = elementText?.trim()
        if (normalizedText) textContentArray.push(normalizedText)
      })
    })

    return textContentArray.join(' ')
  }, selector)

  return allText
}
