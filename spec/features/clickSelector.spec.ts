describe('clickSelector', () => {
  it('succeeds when the selector is found', async () => {
    await clickSelector('#my-button')
  })

  it('fails when the selector is not found', async () => {
    await clickSelector('#my-button', { timeout: 50 })
    await expect(async () => {
      await clickSelector('#not-found', { timeout: 50 })
    }).rejects.toThrow()
  })
})
