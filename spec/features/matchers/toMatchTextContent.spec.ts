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

  context('form-control values', () => {
    it('matches an exact string within an input value', async () => {
      await expect(page).toMatchTextContent('Periwinkle Tanglewood')
    })

    it('matches a case-insensitive regex within an input value', async () => {
      await expect(page).toMatchTextContent(/periwinkle tanglewood/i)
    })

    it('matches an exact string within a textarea value', async () => {
      await expect(page).toMatchTextContent('Juniper Ashgrove')
    })

    it('matches a case-insensitive regex within a textarea value', async () => {
      await expect(page).toMatchTextContent(/juniper ashgrove/i)
    })
  })
})

describe('toMatchTextContent CSS-hidden content', () => {
  it.each([
    [
      'display-none text',
      '<div id="scope" style="display:none">Concealed sentinel</div>',
      '#scope',
    ],
    [
      'visibility-hidden text',
      '<div id="scope" style="visibility:hidden">Concealed sentinel</div>',
      '#scope',
    ],
    [
      'display-none ancestor',
      '<div style="display:none"><div id="scope" style="visibility:visible">Concealed sentinel</div></div>',
      '#scope',
    ],
    [
      'visibility-hidden ancestor',
      '<div style="visibility:hidden"><div id="scope">Concealed sentinel</div></div>',
      '#scope',
    ],
    [
      'display-none input',
      '<input id="scope" style="display:none" value="Concealed sentinel">',
      '#scope',
    ],
    [
      'visibility-hidden input',
      '<input id="scope" style="visibility:hidden" value="Concealed sentinel">',
      '#scope',
    ],
    [
      'display-none textarea ancestor',
      '<div style="display:none"><textarea id="scope">Concealed sentinel</textarea></div>',
      '#scope',
    ],
    [
      'visibility-hidden textarea ancestor',
      '<div style="visibility:hidden"><textarea id="scope">Concealed sentinel</textarea></div>',
      '#scope',
    ],
    [
      'non-HTML text fallback with hidden child',
      '<svg id="scope"><text>Shown vector<tspan style="display:none">Concealed sentinel</tspan></text></svg>',
      '#scope',
    ],
    ['hidden-type input', '<input id="scope" type="hidden" value="Concealed sentinel">', '#scope'],
    [
      'display-contents hidden child',
      '<div id="scope" style="display:contents">Shown content<span style="display:none">Concealed sentinel</span></div>',
      '#scope',
    ],
  ])('excludes %s', async (_name, html, selector) => {
    await page.setContent(html)
    for (const scope of [undefined, selector]) {
      await expect(async () => {
        await expect(page).toMatchTextContent('Concealed sentinel', {
          selector: scope,
          timeout: 100,
        })
      }).rejects.toThrow()
    }
  })
})

describe('toMatchTextContent preservation', () => {
  it.each([
    [
      'CSS text transformation',
      '<div id="scope" style="text-transform:uppercase">Transformed sentinel</div>',
      'TRANSFORMED SENTINEL',
      '#scope',
    ],
    [
      'non-HTML text fallback contiguity',
      '<svg id="scope"><text>Vec<tspan>tor sentinel</tspan></text></svg>',
      'Vector sentinel',
      '#scope',
    ],
    ['split-markup phrase', '<dl id="scope"><dt>Sleeps</dt><dd>4</dd></dl>', 'Sleeps 4', '#scope'],
    [
      'multiple selector roots',
      '<div class="scope">First sentinel</div><div class="scope">Second sentinel</div>',
      'First sentinel Second sentinel',
      '.scope',
    ],
    [
      'display-contents direct text',
      '<div id="scope" style="display:contents;text-transform:uppercase">Contents direct <span>child</span></div>',
      'CONTENTS DIRECT',
      '#scope',
    ],
    [
      'visibility-restored descendant',
      '<div id="scope" style="visibility:hidden">Hidden parent<span style="visibility:visible">Restored sentinel</span><input style="visibility:visible" value="Restored value"></div>',
      'Restored sentinel',
      '#scope',
    ],
    [
      'visibility-restored input value',
      '<div id="scope" style="visibility:hidden"><input style="visibility:visible" value="Restored input"></div>',
      'Restored input',
      '#scope',
    ],
    [
      'visibility-restored value',
      '<div id="scope" style="visibility:hidden"><textarea style="visibility:visible">Restored value</textarea></div>',
      'Restored value',
      '#scope',
    ],
    [
      'opacity-zero text',
      '<div id="scope" style="opacity:0">Transparent sentinel</div>',
      'Transparent sentinel',
      '#scope',
    ],
    [
      'offscreen text',
      '<div id="scope" style="position:absolute;left:-10000px">Offscreen sentinel</div>',
      'Offscreen sentinel',
      '#scope',
    ],
  ])('preserves %s', async (_name, html, text, selector) => {
    await page.setContent(html)
    for (const scope of [undefined, selector]) {
      await expect(page).toMatchTextContent(text, { selector: scope, timeout: 100 })
    }
  })
  it('preserves entered displayed values and regular expressions', async () => {
    await expect(page).toFill('#my-text-input', 'Entered input sentinel')
    await expect(page).toFill('#my-textarea', 'Entered textarea sentinel')
    for (const text of [/entered input sentinel/i, /entered textarea sentinel/i]) {
      await expect(page).toMatchTextContent(text, { timeout: 100 })
    }
  })

  it('preserves empty selector scopes', async () => {
    await expect(async () => {
      await expect(page).toMatchTextContent('My div', {
        selector: '#missing-text-root',
        timeout: 100,
      })
    }).rejects.toThrow()
  })
})
