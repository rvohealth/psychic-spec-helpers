describe('fillIn', () => {
  it('succeeds when the input is fillable', async () => {
    await fillIn('#my-input', 'hello')
    const inputValue = await page.$eval('#my-input', input => input.value).catch(() => null)
    expect(inputValue).toEqual('hello')
  })

  it('fails when the selector is not found', async () => {
    await fillIn('#my-input', 'hello world', { timeout: 50 })
    await expect(async () => {
      await fillIn('#not-found-input', 'hello world', { timeout: 50 })
    }).rejects.toThrow()
  })
})
