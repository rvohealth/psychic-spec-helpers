describe('toClick', () => {
  it('succeeds when the selector is found', async () => {
    await expect(page).toClick('My div')
  })

  it('fails when the selector is not found', async () => {
    await click('My div', { timeout: 50 })
    await expect(page).toClick('My div', { timeout: 50 })
    await expect(async () => {
      await expect(page).toClick('Not found div', { timeout: 50 })
    }).rejects.toThrow()
  })
})
