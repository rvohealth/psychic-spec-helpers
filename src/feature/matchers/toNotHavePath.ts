import { Page, WaitForSelectorOptions } from 'puppeteer'
import applyDefaultWaitForOpts from '../helpers/applyDefaultWaitForOpts.js'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

/**
 * The negative form of toHavePath: passes as soon as the path of the page's
 * url (without its query or hash) is not unexpectedPath, compared as
 * toHavePath compares them (ignoring one trailing slash on either), retrying
 * until the timeout (5000ms by default).
 */
export default async function toNotHavePath(
  page: Page,
  unexpectedPath: string,
  opts: WaitForSelectorOptions = {}
) {
  requirePuppeteerPage(page)

  try {
    await page.waitForFunction(
      path => {
        function trimPath(path: string) {
          return path.replace(/\/$/, '')
        }

        // @ts-expect-error window
        // eslint-disable-next-line
        return trimPath(new URL(window.location.href).pathname) !== trimPath(path)
      },
      applyDefaultWaitForOpts(opts),
      unexpectedPath
    )
    return {
      pass: true,
      message: () => {
        throw new Error('Cannot negate toNotHavePath, use toHavePath instead')
      },
    }
  } catch {
    const actualPath = pathOf(page.url())
    return {
      pass: false,
      message: () =>
        `Expected page not to have path "${unexpectedPath}", but its path is: "${actualPath}"`,
    }
  }
}

function pathOf(url: string) {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}
