describe('click', () => {
  it('succeeds when the selector is found', async () => {
    await click('My div')
  })

  it('fails when the selector is not found', async () => {
    await click('My div', { timeout: 500 })
    await expect(async () => {
      await click('Not found div', { timeout: 500 })
    }).rejects.toThrow()
  })
})
