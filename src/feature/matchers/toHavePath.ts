import { Page } from 'puppeteer'
import requirePuppeteerPage from '../internal/requirePuppeteerPage.js'

export default async function toHavePath(page: Page, expectedPath: string) {
  requirePuppeteerPage(page)

  await page.waitForFunction(
    // @ts-expect-error window
    path => new URL(window.location.href).pathname === expectedPath,
    {},
    expectedPath
  )
}
