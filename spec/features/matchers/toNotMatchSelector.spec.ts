describe('toNotHaveSelector', () => {
  it('succeeds when the page does not match the selector', async () => {
    await expect(page).toNotHaveSelector('#not-found-selector', { timeout: 300 })
  })

  it('fails when the page does match the selector', async () => {
    await expect(page).toNotHaveSelector('#not-found-selector', { timeout: 50 })
    await expect(async () => {
      await expect(page).toNotHaveSelector('#my-div', { timeout: 50 })
    }).rejects.toThrow()
  })
})
