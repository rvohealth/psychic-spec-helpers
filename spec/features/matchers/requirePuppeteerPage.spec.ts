// The matchers that need a puppeteer page say so by their own name when
// expect is given something else.

const notAPage = {}

const matchers: [string, () => Promise<unknown>][] = [
  ['toHavePath', () => expect(notAPage).toHavePath('/x')],
  ['toHaveUrl', () => expect(notAPage).toHaveUrl('http://x')],
  ['toNotHavePath', () => expect(notAPage).toNotHavePath('/x')],
  ['toNotHaveUrl', () => expect(notAPage).toNotHaveUrl('http://x')],
  ['toHaveSelected', () => expect(notAPage).toHaveSelected('#x', 'y')],
  ['toHaveUnselected', () => expect(notAPage).toHaveUnselected('#x', 'y')],
  ['toHaveValue', () => expect(notAPage).toHaveValue('#x', 'y')],
  ['toNotHaveValue', () => expect(notAPage).toNotHaveValue('#x', 'y')],
  ['toMatchTextContent', () => expect(notAPage).toMatchTextContent('x')],
  ['toNotMatchTextContent', () => expect(notAPage).toNotMatchTextContent('x')],
]

describe('a matcher given something other than a puppeteer page', () => {
  for (const [name, assertion] of matchers) {
    it(`${name} names itself`, async () => {
      await expect(assertion()).rejects.toThrow(
        new RegExp(`^Must pass a puppeteer page to expect when calling ${name}$`)
      )
    })
  }
})
