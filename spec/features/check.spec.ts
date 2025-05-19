describe('check', () => {
  it('succeeds when label for checkbox is found', async () => {
    await check('My checkbox')

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    const inputValue = await page.$eval('#my-checkbox', input => input.checked).catch(() => null)
    expect(inputValue).toBe(true)
  })

  it('fails when the selector is not found', async () => {
    await check('My checkbox', { timeout: 500 })
    await expect(async () => {
      await check('not found checkbox', { timeout: 500 })
    }).rejects.toThrow()
  })

  it('fails when the label points to an invalid input', async () => {
    await check('My checkbox', { timeout: 500 })
    await expect(async () => {
      await check('My invalid label pointer checkbox', { timeout: 500 })
    }).rejects.toThrow()
  })

  it('fails when the label points to a label with a missing htmlFor statement', async () => {
    await check('My checkbox', { timeout: 500 })
    await expect(async () => {
      await check('My missing htmlFor checkbox', { timeout: 500 })
    }).rejects.toThrow()
  })
})
