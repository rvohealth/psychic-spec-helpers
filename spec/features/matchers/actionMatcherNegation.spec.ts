// A matcher that acts on the page cannot be negated. Under .not it throws,
// naming itself, before it waits or acts: it leaves the page as it was, and a
// missing target fails at once instead of passing after the timeout.
const PAGE = `
  <button id="save" onclick="window.acted = true">Save changes</button>
  <a href="#saved" onclick="window.acted = true">Saved list</a>
  <label for="terms">Accept terms</label>
  <input type="checkbox" id="terms" onchange="window.acted = true">
  <label for="news">Get news</label>
  <input type="checkbox" id="news" checked onchange="window.acted = true">
  <input id="name" oninput="window.acted = true">
  <select id="color" onchange="window.acted = true">
    <option value="red">Red</option>
    <option value="blue">Blue</option>
  </select>
`

const cases: {
  matcher: string
  message: string
  present: () => Promise<unknown>
  missing: () => Promise<unknown>
}[] = [
  {
    matcher: 'toClickSelector',
    message: 'Cannot negate toClickSelector',
    present: () => expect(page).not.toClickSelector('#save'),
    missing: () => expect(page).not.toClickSelector('#nothing-here'),
  },
  {
    matcher: 'toClickButton',
    message: 'Cannot negate toClickButton',
    present: () => expect(page).not.toClickButton('Save changes'),
    missing: () => expect(page).not.toClickButton('Nothing here'),
  },
  {
    matcher: 'toClickLink',
    message: 'Cannot negate toClickLink',
    present: () => expect(page).not.toClickLink('Saved list'),
    missing: () => expect(page).not.toClickLink('Nothing here'),
  },
  {
    matcher: 'toClick',
    message: 'Cannot negate toClick',
    present: () => expect(page).not.toClick('Save changes'),
    missing: () => expect(page).not.toClick('Nothing here'),
  },
  {
    matcher: 'toCheck',
    message: 'Cannot negate toCheck',
    present: () => expect(page).not.toCheck('Accept terms'),
    missing: () => expect(page).not.toCheck('Nothing here'),
  },
  {
    matcher: 'toUncheck',
    message: 'Cannot negate toUncheck, try toCheck',
    present: () => expect(page).not.toUncheck('Get news'),
    missing: () => expect(page).not.toUncheck('Nothing here'),
  },
  {
    matcher: 'toFill',
    message: 'cannot negate toFill',
    present: () => expect(page).not.toFill('#name', 'Ada'),
    missing: () => expect(page).not.toFill('#nothing-here', 'Ada'),
  },
  {
    matcher: 'toSelect',
    message: 'Cannot negate toSelect',
    present: () => expect(page).not.toSelect('#color', 'blue'),
    missing: () => expect(page).not.toSelect('#nothing-here', 'blue'),
  },
]

function escaped(message: string) {
  return new RegExp(`^${message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
}

describe('negating a matcher that acts on the page', () => {
  beforeEach(async () => {
    await page.setContent(PAGE)
  })

  for (const { matcher, message, present, missing } of cases) {
    context(matcher, () => {
      it('throws, naming itself, and leaves the page as it was', async () => {
        await expect(present()).rejects.toThrow(escaped(message))

        expect(await page.evaluate('window.acted === undefined')).toBe(true)
        expect(await page.evaluate('document.getElementById("terms").checked')).toBe(false)
        expect(await page.evaluate('document.getElementById("news").checked')).toBe(true)
        expect(await page.evaluate('document.getElementById("name").value')).toBe('')
        expect(await page.evaluate('document.getElementById("color").value')).toBe('red')
      })

      it('fails at once when the target is missing, instead of passing after the timeout', async () => {
        const started = Date.now()
        await expect(missing()).rejects.toThrow(escaped(message))
        expect(Date.now() - started).toBeLessThan(1000)
      })
    })
  }
})
