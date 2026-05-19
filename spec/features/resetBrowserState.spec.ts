/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
// ^ this spec drives DOM globals (document/localStorage) inside page.evaluate;
//   the spec tsconfig has no DOM lib, so they type as `any` here.
import { resetBrowserState } from '../../src/index.js'

describe('resetBrowserState', () => {
  it('clears localStorage/sessionStorage and cookies and navigates to about:blank', async () => {
    await visit('/')

    await page.evaluate(() => {
      localStorage.setItem('token', 'secret')
      sessionStorage.setItem('flash', 'hi')
      document.cookie = 'session=abc; path=/'
    })

    const before = (await page.evaluate(() => ({
      ls: localStorage.getItem('token'),
      cookie: document.cookie,
    }))) as { ls: string | null; cookie: string }
    expect(before.ls).toEqual('secret')
    expect(before.cookie).toContain('session=abc')

    await resetBrowserState()

    expect(page.url()).toEqual('about:blank')

    await visit('/')
    const after = (await page.evaluate(() => ({
      ls: localStorage.getItem('token'),
      ss: sessionStorage.getItem('flash'),
      cookie: document.cookie,
    }))) as { ls: string | null; ss: string | null; cookie: string }
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
