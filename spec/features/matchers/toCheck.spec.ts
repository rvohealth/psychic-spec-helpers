describe('toCheck', () => {
  it('succeeds when label for checkbox is found', async () => {
    await expect(page).toCheck('My checkbox')
    const inputValue = await page.$eval('#my-checkbox', input => input.checked).catch(() => null)
    expect(inputValue).toBe(true)
  })

  it('fails when the selector is not found', async () => {
    await expect(page).toCheck('My checkbox', { timeout: 50 })
    await expect(async () => {
      await expect(page).toCheck('not found checkbox', { timeout: 50 })
    }).rejects.toThrow()
  })
})
