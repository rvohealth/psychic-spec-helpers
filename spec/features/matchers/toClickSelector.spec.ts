describe('toClickSelector', () => {
  it('succeeds when the selector is found', async () => {
    await expect(page).toClickSelector('#my-button')
  })

  it('fails when the selector is not found', async () => {
    await expect(page).toClickSelector('#my-button', { timeout: 50 })
    await expect(async () => {
      await expect(page).toClickSelector('#not-found', { timeout: 50 })
    }).rejects.toThrow()
  })
})
