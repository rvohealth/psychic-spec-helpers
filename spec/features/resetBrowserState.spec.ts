import { resetBrowserState } from '../../src/index.js'

// `document` isn't in the Node lib this package is type-checked against; these
// evaluate callbacks run in the browser, so pull it off globalThis with a cast
// (same idiom as src/feature/helpers/resetBrowserState.ts)
type DocumentGlobal = { document: { cookie: string } }

describe('resetBrowserState', () => {
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
})
