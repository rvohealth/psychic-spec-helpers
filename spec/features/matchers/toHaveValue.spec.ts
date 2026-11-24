import { Page } from 'puppeteer'
import { launchPage } from '../../../src/index.js'

const form =
  '<input id="place" value="Corner Cafe"><textarea id="notes">Bring snacks</textarea><select id="status"><option value="pending">Pending review</option><option value="active" selected>Active</option></select>'

describe('toHaveValue', () => {
  it('matches the value of an input, a textarea and a select', async () => {
    await page.setContent(form)
    await expect(page).toHaveValue('#place', 'Corner Cafe', { timeout: 300 })
    await expect(page).toHaveValue('#notes', 'Bring snacks', { timeout: 300 })
    await expect(page).toHaveValue('#status', 'active', { timeout: 300 })
  })

  it('matches the whole value, not a part of it', async () => {
    await page.setContent(form)
    await expect(async () => {
      await expect(page).toHaveValue('#place', 'Corner', { timeout: 300 })
    }).rejects.toThrow('Expected "#place" to have value "Corner", but its value is: "Corner Cafe"')
  })

  it('matches a regular expression', async () => {
    await page.setContent(form)
    await expect(page).toHaveValue('#place', /cafe$/i, { timeout: 300 })
    await expect(async () => {
      await expect(page).toHaveValue('#place', /diner/i, { timeout: 300 })
    }).rejects.toThrow('Expected "#place" to have value /diner/i, but its value is: "Corner Cafe"')
  })

  it('reads a typed value that the value attribute does not show', async () => {
    await page.setContent(form)
    await expect(page).toFill('#place', 'Trailhead')
    await expect(page).toHaveValue('#place', 'Trailhead', { timeout: 300 })
    await expect(async () => {
      await expect(page).toHaveSelector('#place[value="Trailhead"]', { timeout: 300 })
    }).rejects.toThrow()
  })

  it('waits for a value set after the assertion starts', async () => {
    await page.setContent(
      `${form}<script>setTimeout(() => { document.getElementById('place').value = 'Trailhead' }, 300)</script>`
    )
    await expect(page).toHaveValue('#place', 'Trailhead', { timeout: 2000 })
  })

  it('uses the first matching field a user can see', async () => {
    await page.setContent(
      '<input class="place" style="display:none" value="Hidden Cafe"><input class="place" value="Corner Cafe">'
    )
    await expect(page).toHaveValue('.place', 'Corner Cafe', { timeout: 300 })
  })

  it('fails when nothing matches the selector', async () => {
    await page.setContent(form)
    await expect(async () => {
      await expect(page).toHaveValue('#missing', 'Corner Cafe', { timeout: 300 })
    }).rejects.toThrow(
      'Expected page to have an input, textarea or select matching "#missing" that a user can see, but nothing matches that selector'
    )
  })

  it('fails when the element is not a field', async () => {
    await page.setContent('<div id="place">Corner Cafe</div>')
    await expect(async () => {
      await expect(page).toHaveValue('#place', 'Corner Cafe', { timeout: 300 })
    }).rejects.toThrow('the element matching it is hidden or not an input, textarea or select')
  })

  for (const [hiddenBy, html] of [
    ['display: none', '<input id="place" value="Corner Cafe" style="display:none">'],
    ['a display: none ancestor', '<div hidden><input id="place" value="Corner Cafe"></div>'],
    ['visibility: hidden', '<input id="place" value="Corner Cafe" style="visibility:hidden">'],
    ['type=hidden', '<input id="place" type="hidden" value="Corner Cafe">'],
  ]) {
    it(`fails for a field hidden by ${hiddenBy}, like toMatchTextContent`, async () => {
      await page.setContent(html)
      await expect(async () => {
        await expect(page).toHaveValue('#place', 'Corner Cafe', { timeout: 300 })
      }).rejects.toThrow('is hidden or not an input, textarea or select')
      await expect(page).toNotMatchTextContent('Corner Cafe', { timeout: 300 })
    })
  }

  it('cannot be negated', async () => {
    await page.setContent(form)
    await expect(async () => {
      await expect(page).not.toHaveValue('#place', 'Corner Cafe', { timeout: 300 })
    }).rejects.toThrow('Cannot negate toHaveValue, use toNotHaveValue instead')
  })
})

// The value matchers read the page through a string page.evaluate (see
// evaluateWithVisibilityRules), which Firefox (WebDriver BiDi) and Chrome
// (CDP) run differently, so run them on both, as the text matchers' select
// menu specs do.
for (const browser of ['firefox', 'chrome'] as const) {
  describe('value matchers on ' + browser, () => {
    let browserPage: Page

    beforeAll(async () => {
      browserPage = await launchPage({
        browser,
        // GitHub's Ubuntu runners block Chrome's sandbox.
        ...(browser === 'chrome' && process.platform === 'linux' && process.env.CI === 'true'
          ? { args: ['--no-sandbox'] }
          : {}),
      })
    })

    afterAll(async () => {
      await browserPage.browser().close()
    })

    it('matches the value of an input, a textarea and a select', async () => {
      await browserPage.setContent(form)
      await expect(browserPage).toHaveValue('#place', 'Corner Cafe', { timeout: 300 })
      await expect(browserPage).toHaveValue('#notes', 'Bring snacks', { timeout: 300 })
      await expect(browserPage).toHaveValue('#status', 'active', { timeout: 300 })
      await expect(browserPage).toNotHaveValue('#place', 'Trailhead', { timeout: 300 })
    })

    it('waits for a value set after the assertion starts', async () => {
      await browserPage.setContent(
        `${form}<script>setTimeout(() => { document.getElementById('place').value = 'Trailhead' }, 300)</script>`
      )
      await expect(browserPage).toHaveValue('#place', 'Trailhead', { timeout: 2000 })
      await expect(browserPage).toNotHaveValue('#place', 'Corner Cafe', { timeout: 300 })
    })

    it('names the actual value when it fails', async () => {
      await browserPage.setContent(form)
      await expect(async () => {
        await expect(browserPage).toHaveValue('#place', 'Corner', { timeout: 300 })
      }).rejects.toThrow(
        'Expected "#place" to have value "Corner", but its value is: "Corner Cafe"'
      )
      await expect(async () => {
        await expect(browserPage).toNotHaveValue('#place', 'Corner Cafe', { timeout: 300 })
      }).rejects.toThrow(
        'Expected "#place" not to have value "Corner Cafe", but its value is: "Corner Cafe"'
      )
    })

    it('counts a hidden field as missing', async () => {
      await browserPage.setContent(
        '<input id="place" style="visibility: hidden" value="Corner Cafe">'
      )
      await expect(async () => {
        await expect(browserPage).toHaveValue('#place', 'Corner Cafe', { timeout: 300 })
      }).rejects.toThrow('is hidden or not an input, textarea or select')
    })
  })
}
