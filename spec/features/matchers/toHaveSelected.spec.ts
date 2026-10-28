const countryMenu =
  '<select id="country"><option value="ca">Canada</option><option value="mx" selected>Mexico</option></select>'

describe('toHaveSelected', () => {
  it('succeeds when the labeled option is selected', async () => {
    await page.setContent(countryMenu)
    await expect(page).toHaveSelected('#country', 'Mexico', { timeout: 300 })
  })

  it('matches the label the user sees, not the option value', async () => {
    await page.setContent(countryMenu)
    await expect(async () => {
      await expect(page).toHaveSelected('#country', 'mx', { timeout: 300 })
    }).rejects.toThrow('to have an option labeled "mx"')
  })

  it('fails when another option is selected', async () => {
    await page.setContent(countryMenu)
    await expect(async () => {
      await expect(page).toHaveSelected('#country', 'Canada', { timeout: 300 })
    }).rejects.toThrow('but the selected option is: "Mexico"')
  })

  it('fails when the select is not found', async () => {
    await page.setContent(countryMenu)
    await expect(async () => {
      await expect(page).toHaveSelected('#missing', 'Mexico', { timeout: 300 })
    }).rejects.toThrow('none was found')
  })

  it('waits for a selection made after the assertion starts', async () => {
    await page.setContent(countryMenu)
    await page.evaluate(() => {
      const browserGlobals = globalThis as unknown as {
        document: { querySelector: (selector: string) => { value: string } }
      }
      setTimeout(() => {
        browserGlobals.document.querySelector('#country').value = 'ca'
      }, 100)
    })
    await expect(page).toHaveSelected('#country', 'Canada', { timeout: 1000 })
  })

  it('checks each selected option of a multiple select', async () => {
    await page.setContent(
      '<select id="toppings" multiple><option selected>Basil</option><option>Olives</option><option selected>Onion</option></select>'
    )
    await expect(page).toHaveSelected('#toppings', 'Basil', { timeout: 300 })
    await expect(page).toHaveSelected('#toppings', 'Onion', { timeout: 300 })
  })

  it('confirms an option chosen with toSelect', async () => {
    await expect(page).toSelect('#select-box', 'option 2')
    await expect(page).toHaveSelected('#select-box', 'option 2', { timeout: 300 })
  })
})
