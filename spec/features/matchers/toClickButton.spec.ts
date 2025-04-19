describe('toClickButton', () => {
  it('succeeds when the selector is found', async () => {
    await expect(page).toClickButton('My button')
  })

  it('fails when the selector is not found', async () => {
    await expect(page).toClickButton('My button', { timeout: 500 })
    await expect(async () => {
      await expect(page).toClickButton('Not found button', { timeout: 500 })
    }).rejects.toThrow()
  })
})
