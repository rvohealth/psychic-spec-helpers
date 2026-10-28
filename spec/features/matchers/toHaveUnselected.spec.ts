const statusMenu =
  '<select id="status"><option value="pending">Pending review</option><option value="active" selected>Active</option></select>'

describe('toHaveUnselected', () => {
  it('succeeds when the option with the value is not selected', async () => {
    await page.setContent(statusMenu)
    await expect(page).toHaveUnselected('#status', 'pending', { timeout: 300 })
  })

  it('fails when the option with the value is selected', async () => {
    await page.setContent(statusMenu)
    await expect(async () => {
      await expect(page).toHaveUnselected('#status', 'active', { timeout: 300 })
    }).rejects.toThrow('"active" not to be selected')
  })

  it('fails when no option has the value, so a typo or a label cannot pass', async () => {
    await page.setContent(statusMenu)
    for (const missing of ['pendng', 'Pending review']) {
      await expect(async () => {
        await expect(page).toHaveUnselected('#status', missing, { timeout: 300 })
      }).rejects.toThrow('its option values are: "pending", "active"')
    }
  })

  it('fails when the select is not found', async () => {
    await page.setContent(statusMenu)
    await expect(async () => {
      await expect(page).toHaveUnselected('#missing', 'pending', { timeout: 300 })
    }).rejects.toThrow('none was found')
  })
})
