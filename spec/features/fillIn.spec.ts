describe('fillIn', () => {
  it('succeeds when the input is fillable', async () => {
    await fillIn('#my-input', 'hello')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    const inputValue = await page.$eval('#my-input', input => input.value).catch(() => null)
    expect(inputValue).toEqual('hello')
  })

  it('fails when the selector is not found', async () => {
    await fillIn('#my-input', 'hello world', { timeout: 500 })
    await expect(async () => {
      await fillIn('#not-found-input', 'hello world', { timeout: 500 })
    }).rejects.toThrow()
  })
})
