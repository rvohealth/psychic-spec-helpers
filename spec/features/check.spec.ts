describe('check', () => {
  it('succeeds when label for checkbox is found', async () => {
    await check('My checkbox')
    const inputValue = await page.$eval('#my-checkbox', input => input.checked).catch(() => null)
    expect(inputValue).toBe(true)
  })

  it('fails when the selector is not found', async () => {
    await check('My checkbox', { timeout: 50 })
    await expect(async () => {
      await check('not found checkbox', { timeout: 50 })
    }).rejects.toThrow()
  })
})
