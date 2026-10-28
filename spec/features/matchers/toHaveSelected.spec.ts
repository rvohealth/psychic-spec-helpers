const statusMenu =
  '<select id="status"><option value="pending">Pending review</option><option value="active" selected>Active</option></select>'

describe('toHaveSelected', () => {
  it('succeeds when the option with the value is selected', async () => {
    await page.setContent(statusMenu)
    await expect(page).toHaveSelected('#status', 'active', { timeout: 300 })
  })

  it('matches the option value, not the label the user sees', async () => {
    await page.setContent(statusMenu)
    await expect(async () => {
      await expect(page).toHaveSelected('#status', 'Active', { timeout: 300 })
    }).rejects.toThrow('to have an option with value "Active"')
  })

  it('fails when another option is selected', async () => {
    await page.setContent(statusMenu)
    await expect(async () => {
      await expect(page).toHaveSelected('#status', 'pending', { timeout: 300 })
    }).rejects.toThrow('but the selected value is: "active"')
  })

  it('fails when the select is not found', async () => {
    await page.setContent(statusMenu)
    await expect(async () => {
      await expect(page).toHaveSelected('#missing', 'active', { timeout: 300 })
    }).rejects.toThrow('none was found')
  })

  it('waits for a selection made after the assertion starts', async () => {
    await page.setContent(statusMenu)
    await page.evaluate(() => {
      const browserGlobals = globalThis as unknown as {
        document: { querySelector: (selector: string) => { value: string } }
      }
      setTimeout(() => {
        browserGlobals.document.querySelector('#status').value = 'pending'
      }, 100)
    })
    await expect(page).toHaveSelected('#status', 'pending', { timeout: 1000 })
  })

  it('checks each selected option of a multiple select', async () => {
    await page.setContent(
      '<select id="toppings" multiple><option value="basil" selected>Basil</option><option value="olives">Olives</option><option value="onion" selected>Onion</option></select>'
    )
    await expect(page).toHaveSelected('#toppings', 'basil', { timeout: 300 })
    await expect(page).toHaveSelected('#toppings', 'onion', { timeout: 300 })
  })

  it('confirms the value passed to toSelect', async () => {
    await page.setContent(statusMenu)
    await expect(page).toSelect('#status', 'pending')
    await expect(page).toHaveSelected('#status', 'pending', { timeout: 300 })
  })
})
