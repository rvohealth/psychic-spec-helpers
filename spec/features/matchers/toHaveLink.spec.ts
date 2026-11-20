describe('toHaveLink', () => {
  it('succeeds when link with text is found', async () => {
    await expect(page).toHaveLink('My link')
  })

  it('fails when the selector is not found', async () => {
    await expect(page).toHaveLink('My link', { timeout: 500 })
    await expect(async () => {
      await expect(page).toHaveLink('not found link', { timeout: 500 })
    }).rejects.toThrow()
  })

  it('cannot be negated, and says so by its own name', async () => {
    await expect(async () => {
      await expect(page).not.toHaveLink('My link', { timeout: 500 })
    }).rejects.toThrow(/^Cannot negate toHaveLink$/)
  })

  it('names the missing link when it fails', async () => {
    await expect(async () => {
      await expect(page).toHaveLink('not found link', { timeout: 500 })
    }).rejects.toThrow(/^Expected page to have link with text: "not found link"$/)
  })
})
