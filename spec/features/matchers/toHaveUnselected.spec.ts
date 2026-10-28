const countryMenu =
  '<select id="country"><option value="ca">Canada</option><option value="mx" selected>Mexico</option></select>'

describe('toHaveUnselected', () => {
  it('succeeds when the labeled option is not selected', async () => {
    await page.setContent(countryMenu)
    await expect(page).toHaveUnselected('#country', 'Canada', { timeout: 300 })
  })

  it('fails when the labeled option is selected', async () => {
    await page.setContent(countryMenu)
    await expect(async () => {
      await expect(page).toHaveUnselected('#country', 'Mexico', { timeout: 300 })
    }).rejects.toThrow('"Mexico" not to be selected')
  })

  it('fails when no option has the label, so a typo cannot pass', async () => {
    await page.setContent(countryMenu)
    await expect(async () => {
      await expect(page).toHaveUnselected('#country', 'Canda', { timeout: 300 })
    }).rejects.toThrow('its options are: "Canada", "Mexico"')
  })

  it('fails when the select is not found', async () => {
    await page.setContent(countryMenu)
    await expect(async () => {
      await expect(page).toHaveUnselected('#missing', 'Canada', { timeout: 300 })
    }).rejects.toThrow('none was found')
  })
})
