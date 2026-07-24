describe('toHaveSelector', () => {
  it('succeeds when the selector is present', async () => {
    await expect(page).toHaveSelector('#my-button')
  })

  it('fails when the selector is not found', async () => {
    await expect(page).toHaveSelector('#my-button', { timeout: 500 })
    await expect(async () => {
      await expect(page).toHaveSelector('#not-found-button', { timeout: 500 })
    }).rejects.toThrow()
  })

  it('succeeds for a present-but-hidden element, since presence ignores visibility', async () => {
    await expect(page).toHaveSelector('#my-hidden-div', { timeout: 500 })
  })

  it('succeeds for a present-but-hidden element even when { visible: true } is passed, since visibility opts are ignored', async () => {
    await expect(page).toHaveSelector('#my-hidden-div', { visible: true, timeout: 500 })
  })
})
