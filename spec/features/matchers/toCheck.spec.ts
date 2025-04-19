describe('toCheck', () => {
  it('succeeds when label for checkbox is found', async () => {
    await expect(page).toCheck('My checkbox')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    const inputValue = await page.$eval('#my-checkbox', input => input.checked).catch(() => null)
    expect(inputValue).toBe(true)
  })

  it('fails when the selector is not found', async () => {
    await expect(page).toCheck('My checkbox', { timeout: 500 })
    await expect(async () => {
      await expect(page).toCheck('not found checkbox', { timeout: 500 })
    }).rejects.toThrow()
  })
})
