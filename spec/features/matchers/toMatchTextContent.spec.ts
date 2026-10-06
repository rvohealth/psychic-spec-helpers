import { Page } from 'puppeteer'
import { launchPage } from '../../../src/index.js'

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
      'adjacent visibility-restored spans',
      '<div id="scope" style="visibility:hidden">Concealed sentinel<span style="visibility:visible">Re</span><span style="visibility:visible">stored sentinel</span></div>',
      'Restored sentinel',
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

describe('toMatchTextContent Chrome option aggregation', () => {
  let chromePage: Page

  beforeAll(async () => {
    chromePage = await launchPage({ browser: 'chrome' })
  })

  afterAll(async () => {
    await chromePage.browser().close()
  })

  it.each(['display:none', 'visibility:hidden'])('excludes a %s option label', async css => {
    await chromePage.setContent(
      `<select id="scope" size="2"><option selected>Shown sentinel</option><option style="${css}">Concealed sentinel</option></select>`
    )
    for (const scope of [undefined, '#scope']) {
      await expect(async () => {
        await expect(chromePage).toMatchTextContent('Concealed sentinel', {
          selector: scope,
          timeout: 100,
        })
      }).rejects.toThrow()
    }
  })

  it.each([
    [
      'visible unselected option',
      '<select id="scope"><option selected>Chosen sentinel</option><option>Unselected sentinel</option><option style="display:none">Concealed sentinel</option></select>',
      'Unselected sentinel',
      '#scope',
    ],
    [
      'duplicate visible option label',
      '<select id="scope" size="2"><option selected>Duplicate sentinel</option><option style="display:none">Duplicate sentinel</option></select>',
      'Duplicate sentinel',
      '#scope',
    ],
    [
      'duplicate direct text before a select',
      '<div id="scope" style="white-space:pre">Shown sentinel\nConcealed sentinel\nDirect tail<select size="2"><option>Shown sentinel</option><option style="display:none">Concealed sentinel</option></select></div>',
      'Shown sentinel\nConcealed sentinel\nDirect tail',
      '#scope',
    ],
    [
      'duplicate direct text after a select',
      '<div id="scope" style="white-space:pre"><select size="2"><option>Shown sentinel</option><option style="display:none">Concealed sentinel</option></select>Shown sentinel\nConcealed sentinel\nDirect tail</div>',
      'Shown sentinel\nConcealed sentinel\nDirect tail',
      '#scope',
    ],
    [
      'transformed direct text beside a select',
      '<div id="scope" style="text-transform:uppercase">Prefix sentinel<select size="2"><option>Shown sentinel</option><option style="display:none">Concealed sentinel</option></select>Suffix sentinel</div>',
      'PREFIX SENTINEL',
      '#scope',
    ],
    [
      'inline transformed direct text beside a select',
      '<div id="scope" style="text-transform:uppercase">Pre<span>fix</span> sentinel<select size="2"><option>Shown sentinel</option><option style="display:none">Concealed sentinel</option></select></div>',
      'PREFIX SENTINEL',
      '#scope',
    ],
    [
      'capitalized split inline text beside a select',
      '<div id="scope" style="text-transform:capitalize">sen<span>ti</span>nel<select size="2"><option>Shown sentinel</option><option style="display:none">Concealed sentinel</option></select></div>',
      'Sentinel',
      '#scope',
    ],
    [
      'locale transformed direct text beside a select',
      '<div id="scope" lang="tr" style="text-transform:uppercase">iyi sentinel<select size="2"><option>Shown sentinel</option><option style="display:none">Concealed sentinel</option></select></div>',
      'İYİ SENTİNEL',
      '#scope',
    ],
    [
      'math transformed direct text beside a select',
      '<div id="scope" style="text-transform:math-auto">x<select size="2"><option>Shown sentinel</option><option style="display:none">Concealed sentinel</option></select></div>',
      '𝑥',
      '#scope',
    ],
    [
      'preformatted inline text beside a select',
      '<div id="scope" style="white-space:pre">Start  <span>middle</span>  end<select size="2"><option>Shown sentinel</option><option style="display:none">Concealed sentinel</option></select></div>',
      'Start  middle  end',
      '#scope',
    ],
    [
      'restored inline spans beside a select',
      '<div id="scope" style="visibility:hidden"><span style="visibility:visible">Re</span><span style="visibility:visible">stored sentinel</span><select style="visibility:visible" size="2"><option>Shown sentinel</option><option style="display:none">Concealed sentinel</option></select></div>',
      'Restored sentinel',
      '#scope',
    ],
    [
      'split markup beside a select',
      '<div id="scope"><dl><dt>Sleeps</dt><dd>4</dd></dl><select size="2"><option>Shown sentinel</option><option style="visibility:hidden">Concealed sentinel</option></select></div>',
      'Sleeps 4',
      '#scope',
    ],
  ])('preserves %s', async (_name, html, text, selector) => {
    await chromePage.setContent(html)
    for (const scope of [undefined, selector]) {
      await expect(chromePage).toMatchTextContent(text, { selector: scope, timeout: 100 })
    }
  })
})

for (const browser of ['firefox', 'chrome'] as const) {
  describe('toMatchTextContent inline boundary spaces on ' + browser, () => {
    let browserPage: Page

    beforeAll(async () => {
      browserPage = await launchPage({ browser })
    })

    afterAll(async () => {
      await browserPage.browser().close()
    })

    it.each([
      [
        'normal nested-inline boundary spaces',
        '<div id="scope">A<span> B<select style="display:none"><option>Hidden sentinel</option></select> </span>C</div>',
        'A B C',
      ],
      [
        'preformatted nested-inline boundary spaces',
        '<div id="scope" style="white-space:pre">A<span>  B<select style="display:none"><option>Hidden sentinel</option></select>  </span>C</div>',
        'A  B  C',
      ],
    ])('preserves %s', async (_name, html, text) => {
      await browserPage.setContent(html)
      for (const selector of [undefined, '#scope']) {
        await expect(browserPage).toMatchTextContent(text, { selector, timeout: 100 })
      }
    })
  })
}
