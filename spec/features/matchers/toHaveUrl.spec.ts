describe('toHaveUrl', () => {
  it('succeeds when the page matches the url', async () => {
    await expect(page).toHaveUrl('http://localhost:3000/')
    await expect(page).toHaveUrl('http://localhost:3000')
  })

  it('fails when the page does not match the url', async () => {
    await expect(page).toHaveUrl('http://localhost:3000/', { timeout: 500 })
    await expect(async () => {
      await expect(page).toHaveUrl('http://localhost:3000/not-here', { timeout: 500 })
    }).rejects.toThrow()
  })

  it('cannot be negated, and points to toNotHaveUrl', async () => {
    await expect(async () => {
      await expect(page).not.toHaveUrl('http://localhost:3000/', { timeout: 500 })
    }).rejects.toThrow('cannot negate toHaveUrl, use toNotHaveUrl instead.')
  })
})
