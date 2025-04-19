describe('uncheck', () => {
  it('succeeds when label for checkbox is found', async () => {
    await check('My checkbox')
    let inputValue = await page.$eval('#my-checkbox', input => input.checked).catch(() => null)
    expect(inputValue).toBe(true)

    await uncheck('My checkbox')
    inputValue = await page.$eval('#my-checkbox', input => input.checked).catch(() => null)
    expect(inputValue).toBe(false)
  })

  it('fails when the selector is not found', async () => {
    await check('My checkbox')
    await uncheck('My checkbox', { timeout: 50 })

    await expect(async () => {
      await uncheck('not found checkbox', { timeout: 50 })
    }).rejects.toThrow()
  })
})
