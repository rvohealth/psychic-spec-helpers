describe('uncheck', () => {
  it('succeeds when label for checkbox is found', async () => {
    await check('My checkbox')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    let inputValue = await page.$eval('#my-checkbox', input => input.checked).catch(() => null)
    expect(inputValue).toBe(true)

    await uncheck('My checkbox')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    inputValue = await page.$eval('#my-checkbox', input => input.checked).catch(() => null)
    expect(inputValue).toBe(false)
  })

  it('succeeds when label has nested elements with text matching', async () => {
    await check('My other checkbox')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let inputValue = await page
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      .$eval('#my-other-checkbox', input => input.checked)
      .catch(() => null)
    expect(inputValue).toBe(true)

    await uncheck('My other checkbox')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    inputValue = await page.$eval('#my-other-checkbox', input => input.checked).catch(() => null)
    expect(inputValue).toBe(false)
  })

  it('fails when the selector is not found', async () => {
    await check('My checkbox')
    await uncheck('My checkbox', { timeout: 500 })

    await expect(async () => {
      await uncheck('not found checkbox', { timeout: 500 })
    }).rejects.toThrow()
  })

  it('fails when the selector is found, but it is not already checked', async () => {
    await check('My checkbox')
    await uncheck('My checkbox', { timeout: 500 })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    const inputValue = await page.$eval('#my-checkbox', input => input.checked).catch(() => null)
    expect(inputValue).toBe(false)

    await expect(async () => {
      await uncheck('My checkbox', { timeout: 500 })
    }).rejects.toThrow()
  })
})
