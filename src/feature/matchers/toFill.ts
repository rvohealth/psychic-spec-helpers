import { Page, WaitForSelectorOptions } from 'puppeteer'
import metaOrControlKey from '../helpers/metaOrControlKey.js'

export default async function toFill(
  page: Page,
  cssSelector: string,
  text: string,
  opts?: ToFillMatcherOpts
) {
  try {
    await page.waitForSelector(cssSelector, opts)

    // unless the user opts out, clear the input
    // before typing into it, since most of the
    // time this is what people will expect to
    // happen.
    if (!opts?.bypassInputValueReset) {
      await page.focus(cssSelector)
      await page.keyboard.down(metaOrControlKey())
      await page.keyboard.press('A')
      await page.keyboard.up(metaOrControlKey())
      await page.keyboard.press('Backspace')
    }

    await page.type(cssSelector, text)

    return {
      pass: true,
      message: () => {
        throw new Error('cannot negate toFill')
      },
    }
  } catch {
    return {
      pass: false,
      message: () => `failed to fill input matching selector ${cssSelector} with text "text"`,
    }
  }
}

export type ToFillMatcherOpts = WaitForSelectorOptions & { bypassInputValueReset?: boolean }
