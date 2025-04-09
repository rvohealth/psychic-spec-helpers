import { ToFillMatcherOpts } from '../../matchers/toFill.js'

export default async function fillIn(cssSelector: string, text: string, opts?: ToFillMatcherOpts) {
  await expect(page).toFill(cssSelector, text, opts)
}
