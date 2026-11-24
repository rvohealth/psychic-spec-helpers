import { Page } from 'puppeteer'
import { expect, expectTypeOf, type Assertion } from 'vitest'
import '../../../src/index.js'
import { CustomMatcherResult } from '../../../src/feature/helpers/providePuppeteerViteMatchers.js'

// Compiled by build:test-app; never invoked at runtime.
export async function toHaveValueTypeExamples(page: Page) {
  await expect(page).toHaveValue('#place', 'Corner Cafe')
  await expect(page).toHaveValue('#place', /cafe/i, { timeout: 1000 })
  await expect(page).toNotHaveValue('#place', 'Diner')
  await expect(page).toNotHaveValue('#place', /diner/i, { timeout: 1000 })

  expectTypeOf<Assertion<Page>['toHaveValue']>().parameters.toEqualTypeOf<
    [cssSelector: string, expected: string | RegExp, opts?: { timeout?: number }]
  >()
  expectTypeOf<Assertion<Page>['toHaveValue']>().returns.toEqualTypeOf<
    Promise<CustomMatcherResult>
  >()
  expectTypeOf<Assertion<Page>['toNotHaveValue']>().parameters.toEqualTypeOf<
    [cssSelector: string, unexpected: string | RegExp, opts?: { timeout?: number }]
  >()
  expectTypeOf<Assertion<Page>['toNotHaveValue']>().returns.toEqualTypeOf<
    Promise<CustomMatcherResult>
  >()
}
