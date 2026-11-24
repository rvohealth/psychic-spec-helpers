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

describe('toNotHavePath', () => {
  it('succeeds when the path is not the given path', async () => {
    await expect(page).toNotHavePath('/not-found', { timeout: 300 })
  })

  it('fails when the path keeps matching, naming the path it has', async () => {
    await expect(async () => {
      await expect(page).toNotHavePath('/', { timeout: 300 })
    }).rejects.toThrow('Expected page not to have path "/", but its path is: "/"')
  })

  it('compares only the path, without the query, as toHavePath does', async () => {
    await navigateAfter('/somewhere-else?q=1', 0)
    await expect(page).toHavePath('/somewhere-else', { timeout: 3000 })
    await expect(async () => {
      await expect(page).toNotHavePath('/somewhere-else/', { timeout: 300 })
    }).rejects.toThrow(
      'Expected page not to have path "/somewhere-else/", but its path is: "/somewhere-else"'
    )
  })

  it('succeeds once the page navigates away within the timeout', async () => {
    await navigateAfter('/somewhere-else', 300)
    await expect(page).toNotHavePath('/', { timeout: 3000 })
    await expect(page).toHavePath('/somewhere-else', { timeout: 3000 })
  })

  it('keeps failing when a navigation changes only the query', async () => {
    await navigateAfter('/?q=1', 0)
    await expect(page).toHaveUrl('http://localhost:3000/?q=1', { timeout: 3000 })
    await expect(async () => {
      await expect(page).toNotHavePath('/', { timeout: 300 })
    }).rejects.toThrow('Expected page not to have path "/", but its path is: "/"')
  })

  // A navigation at 4300ms passes with the 5000ms default toHavePath has, and
  // would fail with evaluateWithRetryAndTimeout's 4000ms one.
  it('waits 5000ms by default', async () => {
    await navigateAfter('/somewhere-else', 4300)
    await expect(page).toNotHavePath('/')
  })

  it('cannot be negated', async () => {
    await expect(async () => {
      await expect(page).not.toNotHavePath('/not-found', { timeout: 300 })
    }).rejects.toThrow('Cannot negate toNotHavePath, use toHavePath instead')
  })

  it('declares the same arguments as toHavePath', () => {
    expectTypeOf<Assertion<Page>['toNotHavePath']>().parameters.toEqualTypeOf<
      [unexpectedPath: string, opts?: WaitForSelectorOptions]
    >()
    expectTypeOf<Assertion<Page>['toNotHavePath']>().returns.toEqualTypeOf<
      Promise<CustomMatcherResult>
    >()
  })
})
