describe('toHavePath', () => {
  it('succeeds when the path is correct', async () => {
    await expect(page).toHaveSelector('#my-button')
  })

  it('fails when the selector is not found', async () => {
    await expect(page).toHaveSelector('#my-button', { timeout: 50 })
    await expect(async () => {
      await expect(page).toHaveSelector('#not-found-button', { timeout: 50 })
    }).rejects.toThrow()
  })
})
