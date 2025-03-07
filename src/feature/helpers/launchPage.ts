import { LaunchOptions } from 'puppeteer'
import launchBrowser from './launchBrowser.js'

export default async function launchPage(opts?: LaunchOptions) {
  const browser = await launchBrowser(opts)
  return browser.newPage()
}
