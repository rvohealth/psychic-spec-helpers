describe('clickSelector', () => {
  it('succeeds when the selector is found', async () => {
    await clickSelector('#my-button')
  })

  it('fails when the selector is not found', async () => {
    await clickSelector('#my-button', { timeout: 500 })
    await expect(async () => {
      await clickSelector('#not-found', { timeout: 500 })
    }).rejects.toThrow()
  })
})
