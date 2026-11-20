// A click cannot be negated; the error says which matcher was negated.
describe('negating a click matcher', () => {
  beforeEach(async () => {
    await page.setContent('<button id="save">Save changes</button><a href="#saved">Saved list</a>')
  })

  it('toClickSelector names itself', async () => {
    await expect(async () => {
      await expect(page).not.toClickSelector('#save', { timeout: 500 })
    }).rejects.toThrow(/^Cannot negate toClickSelector$/)
  })

  it('toClickButton names itself', async () => {
    await expect(async () => {
      await expect(page).not.toClickButton('Save changes', { timeout: 500 })
    }).rejects.toThrow(/^Cannot negate toClickButton$/)
  })

  it('toClickLink names itself', async () => {
    await expect(async () => {
      await expect(page).not.toClickLink('Saved list', { timeout: 500 })
    }).rejects.toThrow(/^Cannot negate toClickLink$/)
  })

  it('toClick names itself', async () => {
    await expect(async () => {
      await expect(page).not.toClick('Save changes', { timeout: 500 })
    }).rejects.toThrow(/^Cannot negate toClick$/)
  })
})
