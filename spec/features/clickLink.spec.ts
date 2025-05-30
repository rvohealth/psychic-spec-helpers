describe('clickLink', () => {
  it('succeeds when the selector is found', async () => {
    await clickLink('My link')
  })

  it('fails when the selector is not found', async () => {
    await clickLink('My link', { timeout: 500 })
    await expect(async () => {
      await clickLink('Not found link', { timeout: 500 })
    }).rejects.toThrow()
  })
})
