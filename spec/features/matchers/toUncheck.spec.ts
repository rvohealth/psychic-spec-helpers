describe('uncheck', () => {
  it('succeeds when label for checkbox is found', async () => {
    await check('My checkbox')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    let inputValue = await page.$eval('#my-checkbox', input => input.checked).catch(() => null)
    expect(inputValue).toBe(true)

    await expect(page).toUncheck('My checkbox')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    inputValue = await page.$eval('#my-checkbox', input => input.checked).catch(() => null)
    expect(inputValue).toBe(false)
  })

  it('fails when the selector is not found', async () => {
    await check('My checkbox')
    await expect(page).toUncheck('My checkbox', { timeout: 500 })

    await expect(async () => {
      await expect(page).toUncheck('not found checkbox', { timeout: 500 })
    }).rejects.toThrow()
  })
})
