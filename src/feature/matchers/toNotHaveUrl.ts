import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

/**
 * The negative form of toHaveUrl: passes as soon as the page's url is not
 * unexpectedUrl, compared as toHaveUrl compares them (whole url, ignoring one
 * trailing slash on either), retrying until the timeout (5000ms by default).
 */
export default async function toNotHaveUrl(
  page: Page,
  unexpectedUrl: string,
  opts: WaitForSelectorOptions = {}
) {
  requirePuppeteerPage(page)

  try {
    await page.waitForFunction(
      url => {
        function trimUrl(url: string) {
          return url.replace(/\/$/, '')
        }

        // @ts-expect-error window
        // eslint-disable-next-line
        return trimUrl(window.location.href || '') !== trimUrl(url || '')
      },
      applyDefaultWaitForOpts(opts),
      unexpectedUrl
    )
    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toNotHaveUrl, use toHaveUrl instead')
      },
    }
  } catch {
    const actualUrl = page.url()
    return {
      pass: false,
      message: () =>
        `Expected page not to have url "${unexpectedUrl}", but its url is: "${actualUrl}"`,
    }
  }
}
