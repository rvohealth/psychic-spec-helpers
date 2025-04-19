describe('toMatchTextContent', () => {
  it('succeeds when the page matches the content', async () => {
    await expect(page).toMatchTextContent('My div')
  })

  it('fails when the page does not match the content', async () => {
    await expect(page).toMatchTextContent('My div', { timeout: 50 })
    await expect(async () => {
      await expect(page).toMatchTextContent('not found div', { timeout: 50 })
    }).rejects.toThrow()
  })
})
