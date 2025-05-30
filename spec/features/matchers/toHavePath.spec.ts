describe('toHavePath', () => {
  it('succeeds when the path is correct', async () => {
    await expect(page).toHavePath('/')
  })

  it('fails when the selector is not found', async () => {
    await expect(page).toHavePath('/', { timeout: 500 })
    await expect(async () => {
      await expect(page).toHavePath('/not-found', { timeout: 500 })
    }).rejects.toThrow()
  })
})
