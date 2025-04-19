import { LaunchOptions, Page } from 'puppeteer'
import { launchPage } from '../../../src/index.js'

let page: Page

export default async function getPage(opts?: LaunchOptions) {
  if (!page) {
    page = await launchPage({ headless: process.env.HEADLESS !== '0', timeout: 20000, ...opts })

    // set the browser dimensions prior to running specs
    await page.setViewport({ width: 1200, height: 800 })
  }

  return page
}
