import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http'
import { AddressInfo } from 'node:net'
import { resetBrowserState } from '../../src/index.js'

// `document` isn't in the Node lib this package is type-checked against; these
// evaluate callbacks run in the browser, so pull it off globalThis with a cast
// (same idiom as src/feature/helpers/resetBrowserState.ts)
type DocumentGlobal = { document: { cookie: string } }

// resetBrowserState's internal bound on how long it waits for the page's
// in-flight requests (deliberately not exported); keep in sync with the
// source.
const IN_FLIGHT_LIMIT_MS = 2000

describe('resetBrowserState', () => {
  it('takes no arguments and resolves to void', () => {
    expectTypeOf(resetBrowserState).toEqualTypeOf<() => Promise<void>>()
  })

  it('clears localStorage/sessionStorage and cookies and navigates to about:blank', async () => {
    await visit('/')

    await page.evaluate(() => {
      const { document } = globalThis as unknown as DocumentGlobal
      localStorage.setItem('token', 'secret')
      sessionStorage.setItem('flash', 'hi')
      document.cookie = 'session=abc; path=/'
    })

    const before = await page.evaluate(() => {
      const { document } = globalThis as unknown as DocumentGlobal
      return {
        ls: localStorage.getItem('token'),
        cookie: document.cookie,
      }
    })
    expect(before.ls).toEqual('secret')
    expect(before.cookie).toContain('session=abc')

    await resetBrowserState()

    expect(page.url()).toEqual('about:blank')

    await visit('/')
    const after = await page.evaluate(() => {
      const { document } = globalThis as unknown as DocumentGlobal
      return {
        ls: localStorage.getItem('token'),
        ss: sessionStorage.getItem('flash'),
        cookie: document.cookie,
      }
    })
    expect(after.ls).toBeNull()
    expect(after.ss).toBeNull()
    expect(after.cookie).not.toContain('session=abc')
  })

  it('is a no-op (does not throw) when there is no open page', async () => {
    const original = (globalThis as { page?: unknown }).page
    ;(globalThis as { page?: unknown }).page = undefined
    try {
      await expect(resetBrowserState()).resolves.toBeUndefined()
    } finally {
      ;(globalThis as { page?: unknown }).page = original
    }
  })

  context('with a request still in flight when the spec ends', () => {
    // A stand-in for an app server: the page requests `/slow` and the handler
    // takes `responseDelayMs` to respond (or never responds, when null),
    // the way a Psychic handler doing a database write responds only once
    // the write is done.
    let server: Server
    let baseUrl: string
    let responseDelayMs: number | null
    let requestReceived: () => void
    let requestReceivedPromise: Promise<void>
    let responsesSent: number
    const heldResponses: ServerResponse[] = []

    beforeAll(async () => {
      server = createServer((req: IncomingMessage, res: ServerResponse) => {
        requestReceived()
        if (responseDelayMs === null) {
          heldResponses.push(res)
          return
        }
        setTimeout(() => {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain',
          })
          res.end('done')
          responsesSent++
        }, responseDelayMs)
      })
      await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
      baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    })

    afterAll(async () => {
      for (const res of heldResponses) res.destroy()
      server.closeAllConnections()
      await new Promise<void>(resolve => server.close(() => resolve()))
    })

    beforeEach(() => {
      responsesSent = 0
      requestReceivedPromise = new Promise<void>(resolve => {
        requestReceived = resolve
      })
    })

    // Fire a request from the page without awaiting it, as an app's click
    // handler would, and return once both the browser has sent it (so
    // Puppeteer counts it as in flight) and the server is handling it.
    async function startRequestFromPage() {
      const url = `${baseUrl}/slow`
      const sent = page.waitForRequest(url)
      await page.evaluate((url: string) => {
        void fetch(url).catch(() => undefined)
      }, url)
      await Promise.all([sent, requestReceivedPromise])
    }

    it('returns only after the page has received the response', async () => {
      responseDelayMs = 1000
      await startRequestFromPage()

      await resetBrowserState()

      expect(responsesSent).toEqual(1)
      expect(page.url()).toEqual('about:blank')
    })

    it('gives up after its limit when a response never arrives, without throwing', async () => {
      responseDelayMs = null
      await startRequestFromPage()

      const start = Date.now()
      await expect(resetBrowserState()).resolves.toBeUndefined()
      const elapsed = Date.now() - start

      expect(elapsed).toBeGreaterThanOrEqual(IN_FLIGHT_LIMIT_MS - 50)
      expect(elapsed).toBeLessThan(IN_FLIGHT_LIMIT_MS + 2000)
      expect(page.url()).toEqual('about:blank')
    })

    async function setStorageOnAppOrigin() {
      await visit('/')
      await page.evaluate(() => {
        localStorage.setItem('token', 'previous-spec')
        sessionStorage.setItem('flash', 'previous-spec')
      })
    }

    async function readStorageOnAppOrigin() {
      await visit('/')
      return await page.evaluate(() => [
        localStorage.getItem('token'),
        sessionStorage.getItem('flash'),
      ])
    }

    // A spec that ends right after a link, form or redirect to another origin
    // (an auth provider, say): the navigation commits while the reset waits,
    // so storage must be cleared on the origin the reset started on as well.
    it('clears the storage of the origin it started on when a navigation away is still in flight', async () => {
      responseDelayMs = 500
      await setStorageOnAppOrigin()

      const url = `${baseUrl}/slow`
      const sent = page.waitForRequest(url)
      await page.evaluate((url: string) => {
        const { location } = globalThis as unknown as { location: { assign(url: string): void } }
        location.assign(url)
      }, url)
      await Promise.all([sent, requestReceivedPromise])

      await resetBrowserState()

      expect(page.url()).toEqual('about:blank')
      expect(await readStorageOnAppOrigin()).toEqual([null, null])
    })

    it('clears storage that a response arriving during the wait writes', async () => {
      responseDelayMs = 500
      await visit('/')

      const url = `${baseUrl}/slow`
      const sent = page.waitForRequest(url)
      await page.evaluate((url: string) => {
        void fetch(url)
          .then(() => {
            localStorage.setItem('token', 'late-response')
            sessionStorage.setItem('flash', 'late-response')
          })
          .catch(() => undefined)
      }, url)
      await Promise.all([sent, requestReceivedPromise])

      await resetBrowserState()

      expect(responsesSent).toEqual(1)
      expect(await readStorageOnAppOrigin()).toEqual([null, null])
    })
  })

  it('does not wait for the limit when nothing is in flight', async () => {
    await visit('/')
    await expect(page).toMatchTextContent('My div')

    const start = Date.now()
    await resetBrowserState()
    const elapsed = Date.now() - start

    // Only the short idle window (plus the storage/cookie clear and the
    // about:blank navigation), never the in-flight limit.
    expect(elapsed).toBeLessThan(IN_FLIGHT_LIMIT_MS / 2)
    expect(page.url()).toEqual('about:blank')
  })
})
