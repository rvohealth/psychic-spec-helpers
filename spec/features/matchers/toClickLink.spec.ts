describe('clickLink', () => {
  it('succeeds when the selector is found', async () => {
    await expect(page).toClickLink('My link')
  })

  it('fails when the selector is not found', async () => {
    await expect(page).toClickLink('My link', { timeout: 50 })
    await expect(async () => {
      await expect(page).toClickLink('Not found link', { timeout: 50 })
    }).rejects.toThrow()
  })
})
