describe('toHaveUrl', () => {
  it('succeeds when the page matches the url', async () => {
    await expect(page).toHaveUrl('http://localhost:3000/')
    await expect(page).toHaveUrl('http://localhost:3000')
  })

  it('fails when the page does not match the url', async () => {
    await expect(page).toHaveUrl('http://localhost:3000/', { timeout: 50 })
    await expect(async () => {
      await expect(page).toHaveUrl('http://localhost:3000/not-here', { timeout: 50 })
    }).rejects.toThrow()
  })
})
