import { LaunchOptions } from 'puppeteer'
import { launchBrowser } from '../../../src/index.js'

export default async function getPage(opts?: LaunchOptions) {
  const browser = await launchBrowser({
    headless: process.env.HEADLESS !== '0',
    timeout: 20000,
    ...opts,
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1200, height: 800 })
  return page
}
