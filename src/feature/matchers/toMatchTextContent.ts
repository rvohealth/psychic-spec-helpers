import { Page, WaitForSelectorOptions } from 'puppeteer'

export default async function toMatchTextContent(
  page: Page,
  text: string,
  { selector = 'body' }: { selector?: string } & WaitForSelectorOptions = {}
) {
  try {
    await page.waitForSelector(`${selector}::-p-text(${text.replace(/"/g, '\\"')})`)
    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toMatchTextContent, use toNotMatchTextContent instead')
      },
    }
  } catch {
    return {
      pass: false,
      message: () => `
expected ${selector} with text:
        ${text}

but no text was found within that selector
      `,
    }
  }
}
