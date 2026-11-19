import puppeteer, { Browser, Page } from 'puppeteer'
import { launchBrowser } from '../../src/index.js'

// Firefox pointer capabilities: 1 coarse, 2 fine, 4 hover (widget/LookAndFeel.h).
const FINE_HOVER = 6
const COARSE = 1
const DESKTOP_POINTER_PREFS = {
  'ui.primaryPointerCapabilities': FINE_HOVER,
  'ui.allPointerCapabilities': FINE_HOVER,
}

// `matchMedia` isn't in the Node lib this package is type-checked against; the evaluate
// callback runs in the browser, so pull it off globalThis with a cast (the
// resetBrowserState spec's idiom).
type MatchMediaGlobal = { matchMedia: (query: string) => { matches: boolean } }

async function mediaMatches(page: Page, queries: string[]) {
  return await page.evaluate((qs: string[]) => {
    const { matchMedia } = globalThis as unknown as MatchMediaGlobal
    return qs.map(q => matchMedia(q).matches)
  }, queries)
}

describe('launchBrowser', () => {
  let browser: Browser | undefined

  afterEach(async () => {
    vi.restoreAllMocks()
    await browser?.close()
    browser = undefined
  })

  context('on Firefox, the default browser', () => {
    // Headless Firefox before 161 reports no pointer on Linux, so the media queries alone
    // pass on macOS with or without the prefs; the spy pins the default on every platform.
    it('reports a fine, hover-capable pointer by default', async () => {
      const launch = vi.spyOn(puppeteer, 'launch')
      browser = await launchBrowser()

      expect(launch).toHaveBeenCalledWith(
        expect.objectContaining({ browser: 'firefox', extraPrefsFirefox: DESKTOP_POINTER_PREFS })
      )
      const page = await browser.newPage()
      expect(
        await mediaMatches(page, [
          '(hover: hover)',
          '(pointer: fine)',
          '(any-hover: hover)',
          '(any-pointer: fine)',
          '(hover: none)',
          '(pointer: none)',
        ])
      ).toEqual([true, true, true, true, false, false])
    })

    it("lets the caller's prefs override the defaults", async () => {
      browser = await launchBrowser({
        extraPrefsFirefox: {
          'ui.primaryPointerCapabilities': COARSE,
          'ui.allPointerCapabilities': COARSE,
        },
      })

      const page = await browser.newPage()
      expect(
        await mediaMatches(page, [
          '(pointer: coarse)',
          '(hover: none)',
          '(any-pointer: fine)',
          '(hover: hover)',
        ])
      ).toEqual([true, true, false, false])
    })

    it('keeps the default for the pointer pref the caller does not set', async () => {
      const launch = vi.spyOn(puppeteer, 'launch')
      browser = await launchBrowser({
        extraPrefsFirefox: { 'ui.primaryPointerCapabilities': COARSE },
      })

      expect(launch).toHaveBeenCalledWith(
        expect.objectContaining({
          extraPrefsFirefox: {
            'ui.primaryPointerCapabilities': COARSE,
            'ui.allPointerCapabilities': FINE_HOVER,
          },
        })
      )
      const page = await browser.newPage()
      expect(await mediaMatches(page, ['(pointer: coarse)', '(any-pointer: fine)'])).toEqual([
        true,
        true,
      ])
    })

    it("keeps the caller's other prefs alongside the defaults", async () => {
      const launch = vi.spyOn(puppeteer, 'launch')
      browser = await launchBrowser({ extraPrefsFirefox: { 'ui.prefersReducedMotion': 1 } })

      expect(launch).toHaveBeenCalledWith(
        expect.objectContaining({
          extraPrefsFirefox: { ...DESKTOP_POINTER_PREFS, 'ui.prefersReducedMotion': 1 },
        })
      )
      const page = await browser.newPage()
      expect(
        await mediaMatches(page, ['(prefers-reduced-motion: reduce)', '(hover: hover)'])
      ).toEqual([true, true])
    })
  })

  context('on Chrome', () => {
    // Chrome is not launched: puppeteer.launch is replaced, so these pin only the options
    // launchBrowser hands to Puppeteer.
    it('passes no Firefox prefs', async () => {
      const launch = vi.spyOn(puppeteer, 'launch').mockResolvedValue({} as Browser)
      await launchBrowser({ browser: 'chrome' })

      expect(launch).toHaveBeenCalledWith({
        browser: 'chrome',
        dumpio: process.env.DEBUG === '1',
        headless: process.env.HEADLESS !== '0',
      })
    })

    it("passes the caller's Firefox prefs through unchanged", async () => {
      const launch = vi.spyOn(puppeteer, 'launch').mockResolvedValue({} as Browser)
      await launchBrowser({
        browser: 'chrome',
        extraPrefsFirefox: { 'ui.prefersReducedMotion': 1 },
      })

      expect(launch).toHaveBeenCalledWith(
        expect.objectContaining({ extraPrefsFirefox: { 'ui.prefersReducedMotion': 1 } })
      )
    })
  })
})
