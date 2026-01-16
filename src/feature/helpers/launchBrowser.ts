import puppeteer, { Browser, LaunchOptions } from 'puppeteer'

let sharedBrowser: Browser | null = null

export default async function launchBrowser(opts?: LaunchOptions) {
  if (!sharedBrowser || !sharedBrowser.isConnected()) {
    sharedBrowser = await puppeteer.launch({
      browser: 'firefox',
      dumpio: process.env.DEBUG === '1',
      headless: process.env.HEADLESS !== '0',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript-harmony-shipping',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-ipc-flooding-protection',
      ],
      ...opts,
    })
  }
  return sharedBrowser
}

export async function closeBrowser() {
  if (sharedBrowser) {
    await sharedBrowser.close()
    sharedBrowser = null
  }
}
