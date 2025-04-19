describe('clickButton', () => {
  it('succeeds when the selector is found', async () => {
    await clickButton('My button')
  })

  it('fails when the selector is not found', async () => {
    await clickButton('My button', { timeout: 50 })
    await expect(async () => {
      await clickButton('Not found button', { timeout: 50 })
    }).rejects.toThrow()
  })
})
