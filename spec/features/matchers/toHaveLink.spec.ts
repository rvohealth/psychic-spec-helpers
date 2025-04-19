describe('toHaveLink', () => {
  it('succeeds when link with text is found', async () => {
    await expect(page).toHaveLink('My link')
  })

  it('fails when the selector is not found', async () => {
    await expect(page).toHaveLink('My link', { timeout: 50 })
    await expect(async () => {
      await expect(page).toHaveLink('not found link', { timeout: 50 })
    }).rejects.toThrow()
  })
})
