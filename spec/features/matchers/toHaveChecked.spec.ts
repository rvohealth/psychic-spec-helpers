describe('toHaveChecked', () => {
  it('succeeds when label for checkbox is found', async () => {
    await check('My checkbox')
    await expect(page).toHaveChecked('My checkbox')
  })

  it('fails when the selector is not found', async () => {
    await check('My checkbox', { timeout: 500 })
    await expect(async () => {
      await expect(page).toHaveChecked('not found checkbox', { timeout: 500 })
    }).rejects.toThrow()
  })
})
