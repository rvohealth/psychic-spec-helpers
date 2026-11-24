const form =
  '<input id="place" value="Corner Cafe"><textarea id="notes">Bring snacks</textarea><select id="status"><option value="pending">Pending review</option><option value="active" selected>Active</option></select>'

describe('toNotHaveValue', () => {
  it('succeeds when the value differs', async () => {
    await page.setContent(form)
    await expect(page).toNotHaveValue('#place', 'Corner', { timeout: 300 })
    await expect(page).toNotHaveValue('#notes', 'Bring drinks', { timeout: 300 })
    await expect(page).toNotHaveValue('#status', 'pending', { timeout: 300 })
  })

  it('fails when the value is equal, naming it', async () => {
    await page.setContent(form)
    await expect(async () => {
      await expect(page).toNotHaveValue('#place', 'Corner Cafe', { timeout: 300 })
    }).rejects.toThrow(
      'Expected "#place" not to have value "Corner Cafe", but its value is: "Corner Cafe"'
    )
  })

  it('fails when the value matches a regular expression', async () => {
    await page.setContent(form)
    await expect(page).toNotHaveValue('#place', /diner/i, { timeout: 300 })
    await expect(async () => {
      await expect(page).toNotHaveValue('#place', /cafe/i, { timeout: 300 })
    }).rejects.toThrow('not to have value /cafe/i')
  })

  it('waits for the value to change after the assertion starts', async () => {
    await page.setContent(
      `${form}<script>setTimeout(() => { document.getElementById('place').value = '' }, 300)</script>`
    )
    await expect(page).toNotHaveValue('#place', 'Corner Cafe', { timeout: 2000 })
  })

  it('fails when nothing matches the selector, so a typo cannot pass', async () => {
    await page.setContent(form)
    await expect(async () => {
      await expect(page).toNotHaveValue('#plaec', 'Corner Cafe', { timeout: 300 })
    }).rejects.toThrow('but nothing matches that selector')
  })

  it('fails when the field is hidden', async () => {
    await page.setContent('<input id="place" value="Corner Cafe" style="visibility:hidden">')
    await expect(async () => {
      await expect(page).toNotHaveValue('#place', 'Diner', { timeout: 300 })
    }).rejects.toThrow('is hidden or not an input, textarea or select')
  })

  it('cannot be negated', async () => {
    await page.setContent(form)
    await expect(async () => {
      await expect(page).not.toNotHaveValue('#place', 'Diner', { timeout: 300 })
    }).rejects.toThrow('Cannot negate toNotHaveValue, use toHaveValue instead')
  })
})
