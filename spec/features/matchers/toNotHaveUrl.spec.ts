import { Page, WaitForSelectorOptions } from 'puppeteer'
import { expectTypeOf, type Assertion } from 'vitest'
import { CustomMatcherResult } from '../../../src/feature/helpers/providePuppeteerViteMatchers.js'

// Navigates the page to path (relative to the app) after ms milliseconds.
async function navigateAfter(path: string, ms: number) {
  await page.evaluate(
    (path: string, ms: number) => {
      const { location } = globalThis as unknown as { location: { assign(url: string): void } }
      setTimeout(() => location.assign(path), ms)
    },
    path,
    ms
  )
}

describe('toNotHaveUrl', () => {
  it('succeeds when the page does not match the url', async () => {
    await expect(page).toNotHaveUrl('http://localhost:3000/not-here', { timeout: 300 })
    await expect(page).toNotHaveUrl('http://localhost:3000/?q=1', { timeout: 300 })
  })

  it('fails when the page keeps matching the url, naming the url it has', async () => {
    await expect(async () => {
      await expect(page).toNotHaveUrl('http://localhost:3000/', { timeout: 300 })
    }).rejects.toThrow(
      'Expected page not to have url "http://localhost:3000/", but its url is: "http://localhost:3000/"'
    )
  })

  it('ignores a trailing slash, as toHaveUrl does', async () => {
    await expect(async () => {
      await expect(page).toNotHaveUrl('http://localhost:3000', { timeout: 300 })
    }).rejects.toThrow('Expected page not to have url "http://localhost:3000"')
  })

  it('succeeds once the page navigates away within the timeout', async () => {
    await navigateAfter('/somewhere-else', 300)
    await expect(page).toNotHaveUrl('http://localhost:3000/', { timeout: 3000 })
    await expect(page).toHaveUrl('http://localhost:3000/somewhere-else', { timeout: 3000 })
  })

  // A navigation at 4300ms passes with the 5000ms default toHaveUrl has, and
  // would fail with evaluateWithRetryAndTimeout's 4000ms one.
  it('waits 5000ms by default', async () => {
    await navigateAfter('/somewhere-else', 4300)
    await expect(page).toNotHaveUrl('http://localhost:3000/')
  })

  it('cannot be negated', async () => {
    await expect(async () => {
      await expect(page).not.toNotHaveUrl('http://localhost:3000/not-here', { timeout: 300 })
    }).rejects.toThrow('Cannot negate toNotHaveUrl, use toHaveUrl instead')
  })

  it('declares the same arguments as toHaveUrl', () => {
    expectTypeOf<Assertion<Page>['toNotHaveUrl']>().parameters.toEqualTypeOf<
      [unexpectedUrl: string, opts?: WaitForSelectorOptions]
    >()
    expectTypeOf<Assertion<Page>['toNotHaveUrl']>().returns.toEqualTypeOf<
      Promise<CustomMatcherResult>
    >()
  })
})
