// Calls to toHaveChecked, toHaveUnchecked, toCheck and toUncheck that passed
// before the fallback lookup and the aria-checked read were added keep passing,
// on the same control. Today's label lookup decides whenever it resolves a
// control: the selector it builds from the label's for attribute, with the
// WaitForSelectorOptions passed to it.

describe('checked matchers keep the results of their label lookup', () => {
  context('toCheck with { hidden: true }', () => {
    it('clicks a visibility-hidden label whose for names no element', async () => {
      await page.setContent(
        '<label for="missing" style="visibility: hidden">Hidden terms</label><input type="checkbox" id="terms">'
      )
      await expect(page).toCheck('Hidden terms', { hidden: true, timeout: 500 })
    })

    it('clicks a visibility-hidden label whose control is hidden', async () => {
      await page.setContent(
        '<label for="terms" style="visibility: hidden">Hidden terms</label><input type="checkbox" id="terms" style="display: none">'
      )
      await expect(page).toCheck('Hidden terms', { hidden: true, timeout: 500 })
    })
  })

  it('toUncheck with { hidden: true } unchecks a hidden control through its label', async () => {
    await page.setContent(
      '<label for="terms">Accept terms</label><input type="checkbox" id="terms" style="display: none" checked>'
    )
    await expect(page).toUncheck('Accept terms', { hidden: true, timeout: 500 })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    expect(await page.$eval('#terms', input => input.checked)).toBe(false)
  })

  context('a visibility-hidden label', () => {
    beforeEach(async () => {
      await page.setContent(
        '<label for="terms" style="visibility: hidden">Accept terms</label><input type="checkbox" id="terms" checked>'
      )
    })

    it('still names its control for toHaveChecked', async () => {
      await expect(page).toHaveChecked('Accept terms', { timeout: 500 })
    })

    it('still names its control for toCheck', async () => {
      await expect(page).toCheck('Accept terms', { timeout: 500 })
    })
  })

  it('reads a label without a for attribute as naming the element with id "null", as it always has', async () => {
    await page.setContent(
      '<label>Null terms</label><input type="checkbox" id="null" checked><label>Other null terms</label>'
    )
    await expect(page).toHaveChecked('Null terms', { timeout: 500 })
    await expect(async () => {
      await expect(page).toHaveUnchecked('Null terms', { timeout: 300 })
    }).rejects.toThrow()
  })

  it('looks up the for attribute as a CSS id selector, as it always has', async () => {
    // #a.b is the element with id a and class b, not the one with id "a.b".
    await page.setContent(
      '<label for="a.b">Dotted terms</label><input type="checkbox" id="a" class="b" checked><input type="checkbox" id="a.b">'
    )
    await expect(page).toHaveChecked('Dotted terms', { timeout: 500 })
    await expect(async () => {
      await expect(page).toHaveUnchecked('Dotted terms', { timeout: 300 })
    }).rejects.toThrow()
  })

  it('has toCheck click the label when the CSS id selector finds an unchecked control', async () => {
    await page.setContent(
      '<label for="a.b">Dotted terms</label><input type="checkbox" id="a" class="b"><input type="checkbox" id="a.b">'
    )
    await expect(page).toCheck('Dotted terms', { timeout: 500 })
    // The label's click checks the element its for attribute names.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    expect(await page.$eval('#a\\.b', input => input.checked)).toBe(true)
  })

  it('keeps the control named by the first label it saw while waiting for that control', async () => {
    await page.setContent(
      `<div id="top"></div><label for="a">Accept</label><div id="root"></div><script>
setTimeout(() => { document.getElementById('top').innerHTML = '<label for="b">Accept all</label><input type="checkbox" id="b">' }, 100)
setTimeout(() => { document.getElementById('root').innerHTML = '<input type="checkbox" id="a" checked>' }, 400)
</script>`
    )
    await expect(page).toHaveChecked('Accept', { timeout: 2000 })
  })

  it('applies { visible: true } and { hidden: true } to the control, as it always has', async () => {
    await page.setContent(
      '<label for="terms">Accept terms</label><input type="checkbox" id="terms" style="display: none" checked>'
    )
    await expect(page).toHaveChecked('Accept terms', { timeout: 300 })
    await expect(page).toHaveChecked('Accept terms', { hidden: true, timeout: 300 })
    await expect(async () => {
      await expect(page).toHaveChecked('Accept terms', { visible: true, timeout: 300 })
    }).rejects.toThrow()
  })
})
