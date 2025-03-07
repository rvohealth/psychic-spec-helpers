import puppeteer, { LaunchOptions } from 'puppeteer'

export default async function launchBrowser(opts?: LaunchOptions) {
  return await puppeteer.launch({
    browser: 'firefox',
    dumpio: process.env.DEBUG === '1',
    headless: true,
    ...opts,
  })
}
