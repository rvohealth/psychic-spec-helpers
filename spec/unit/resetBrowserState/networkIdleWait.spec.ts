import { Page } from 'puppeteer'
import resetBrowserState from '../../../src/feature/helpers/resetBrowserState.js'

type Protocol = 'cdp' | 'webDriverBiDi'

// A stand-in for the shared page, recording the order of the reset's steps.
// `protocol` mirrors what Puppeteer's Chrome (CDP) and Firefox (WebDriver
// BiDi) browsers report at runtime.
function stubPage(protocol: Protocol) {
  const steps: string[] = []
  const page = {
    isClosed: () => false,
    url: () => 'http://localhost:3000/',
    browser: () => ({ protocol }),
    evaluate: vi.fn(() => {
      steps.push('evaluate')
      return Promise.resolve()
    }),
    waitForNetworkIdle: vi.fn(() => {
      steps.push('waitForNetworkIdle')
      return Promise.resolve()
    }),
    browserContext: () => ({
      cookies: () => {
        steps.push('cookies')
        return Promise.resolve([])
      },
      deleteCookie: vi.fn(() => Promise.resolve()),
    }),
    goto: vi.fn((url: string) => {
      steps.push(`goto ${url}`)
      return Promise.resolve(null)
    }),
  }
  return { page, steps }
}

function useGlobalPage(page: unknown) {
  ;(globalThis as { page?: unknown }).page = page
}

describe('resetBrowserState', () => {
  let originalPage: Page | undefined

  beforeEach(() => {
    originalPage = (globalThis as { page?: Page }).page
  })

  afterEach(() => {
    useGlobalPage(originalPage)
  })

  context('on a Chrome (CDP) browser', () => {
    it('skips the network-idle wait and resets as in 3.5.0', async () => {
      const { page, steps } = stubPage('cdp')
      useGlobalPage(page)

      await resetBrowserState()

      expect(page.waitForNetworkIdle).not.toHaveBeenCalled()
      expect(steps).toEqual(['evaluate', 'cookies', 'goto about:blank'])
    })
  })

  context('on a Firefox (WebDriver BiDi) browser', () => {
    it('waits for network idle between the two storage clears', async () => {
      const { page, steps } = stubPage('webDriverBiDi')
      useGlobalPage(page)

      await resetBrowserState()

      expect(page.waitForNetworkIdle).toHaveBeenCalledExactlyOnceWith({
        idleTime: 100,
        timeout: 2000,
      })
      expect(steps).toEqual([
        'evaluate',
        'waitForNetworkIdle',
        'evaluate',
        'cookies',
        'goto about:blank',
      ])
    })
  })
})
