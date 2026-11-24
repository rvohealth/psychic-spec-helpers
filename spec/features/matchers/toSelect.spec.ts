describe('toSelect', () => {
  it('succeeds when the selector is found', async () => {
    await expect(page).toSelect('#select-box', 'option 1')
  })

  it('fails when the selector is not found', async () => {
    await expect(page).toSelect('#select-box', 'option 1')

    await expect(async () => {
      await expect(page).toSelect('invalid selector', 'option 1')
    }).rejects.toThrow()
  })

  it('says the select was not found, and why, when nothing matches', async () => {
    await expect(async () => {
      await expect(page).toSelect('#no-such-select', 'option 1', { timeout: 300 })
    }).rejects.toThrow(
      /^Expected page to have a select element matching the css selector "#no-such-select"\. Waiting for selector `#no-such-select` failed/
    )
  })

  it('says why when the element matching is not a select', async () => {
    await page.setContent('<div id="not-a-select"></div>')
    await expect(async () => {
      await expect(page).toSelect('#not-a-select', 'option 1', { timeout: 300 })
    }).rejects.toThrow(
      /^Expected page to have a select element matching the css selector "#not-a-select"\. Element is not a <select> element/
    )
  })
})
