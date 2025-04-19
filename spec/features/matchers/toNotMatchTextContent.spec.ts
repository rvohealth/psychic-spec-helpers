describe('toNotMatchTextContent', () => {
  it('succeeds when the page does not match the content', async () => {
    await expect(page).toNotMatchTextContent('not found div', { timeout: 300 })
  })

  it('fails when the page does match the content', async () => {
    await expect(page).toNotMatchTextContent('not found div', { timeout: 500 })
    await expect(async () => {
      await expect(page).toNotMatchTextContent('My div', { timeout: 500 })
    }).rejects.toThrow()
  })
})
