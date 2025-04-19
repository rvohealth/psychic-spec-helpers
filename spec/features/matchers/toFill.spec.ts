describe('toFill', () => {
  it('succeeds when the input is fillable', async () => {
    await expect(page).toFill('#my-input', 'hello')
    const inputValue = await page.$eval('#my-input', input => input.value).catch(() => null)
    expect(inputValue).toEqual('hello')
  })

  it('fails when the selector is not found', async () => {
    await expect(page).toFill('#my-input', 'hello world', { timeout: 50 })
    await expect(async () => {
      await expect(page).toFill('#not-found-input', 'hello world', { timeout: 50 })
    }).rejects.toThrow()
  })
})
