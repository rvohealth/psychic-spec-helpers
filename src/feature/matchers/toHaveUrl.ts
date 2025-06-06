import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export default async function toHaveUrl(
  page: Page,
  expectedUrl: string,
  opts: WaitForSelectorOptions = {}
) {
  requirePuppeteerPage(page)

  try {
    await page.waitForFunction(
      path => {
        function trimUrl(url: string) {
          return url.replace(/\/$/, '')
        }

        // @ts-expect-error window
        // eslint-disable-next-line
        return trimUrl(window.location.href || '') === trimUrl(path || '')
      },
      applyDefaultWaitForOpts(opts),
      expectedUrl
    )
    return {
      pass: true,
      message: () => {
        throw new Error('cannot negate toHaveUrl, use toNotHaveUrl instead.')
      },
    }
  } catch {
    return {
      pass: false,
      message: () => `page did not navigate to expected url: ${expectedUrl}`,
    }
  }
}
