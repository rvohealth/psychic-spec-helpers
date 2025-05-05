import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'

export default async function toMatchTextContent(
  page: Page,
  text: string,
  opts: { selector?: string } & WaitForSelectorOptions = {}
) {
  try {
    await page.waitForSelector(
      `${opts.selector || 'body'}::-p-text(${text.replace(/"/g, '\\"')})`,
      applyDefaultWaitForOpts(opts)
    )
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
expected ${opts.selector || 'body'} with text:
        ${text}

but no text was found within that selector
      `,
    }
  }
}
