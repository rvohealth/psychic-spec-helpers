describe('toHaveUnchecked', () => {
  it('succeeds when the input is unchecked', async () => {
    await expect(page).toHaveUnchecked('My checkbox')
  })

  it('fails when the input is checked', async () => {
    await expect(page).toHaveUnchecked('My checkbox', { timeout: 500 })
    await expect(async () => {
      await check('My checkbox')
      await expect(page).toHaveUnchecked('My checkbox', { timeout: 500 })
    }).rejects.toThrow()
  })

  it('fails when the input is not found', async () => {
    await check('My checkbox', { timeout: 500 })
    await expect(async () => {
      await expect(page).toHaveUnchecked('not found checkbox', { timeout: 500 })
    }).rejects.toThrow()
  })
})
