import { Page, WaitForSelectorOptions } from 'puppeteer'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export default async function toHavePath(
  page: Page,
  expectedPath: string,
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
        return trimPath(new URL(window.location.href).pathname) === trimPath(path)
      },
      opts,
      expectedPath
    )
    return {
      pass: true,
      message: () => {
        throw new Error('cannot negate toHavePath, use toNotHavePath instead.')
      },
    }
  } catch (err) {
    return {
      pass: false,
      message: () => `page did not navigate to expected path: ${expectedPath}`,
    }
  }
}
