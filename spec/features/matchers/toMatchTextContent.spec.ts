describe('toMatchTextContent', () => {
  it('succeeds when the page matches the content', async () => {
    await expect(page).toMatchTextContent('My div')
  })

  it('succeeds when the page matches a regular expression', async () => {
    await expect(page).toMatchTextContent(/my DIV/i)
  })

  it('succeeds when the selected element matches a regular expression', async () => {
    await expect(page).toMatchTextContent(/my DIV/i, { selector: '#my-div' })
  })

  it('fails when the page does not match the content', async () => {
    await expect(page).toMatchTextContent('My div', { timeout: 500 })
    await expect(async () => {
      await expect(page).toMatchTextContent('not found div', { timeout: 500 })
    }).rejects.toThrow()
  })

  it('fails when the page does not match a regular expression', async () => {
    await expect(async () => {
      await expect(page).toMatchTextContent(/not found div/i, { timeout: 500 })
    }).rejects.toThrow()
  })
})
