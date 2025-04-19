import isPuppeteerPage from './isPuppeteerPage.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function requirePuppeteerPage(argumentPassedToExpect: any) {
  if (!isPuppeteerPage(argumentPassedToExpect)) {
    throw new Error('Must pass a puppeteer page to expect when calling toMatchTextContent')
  }
}
