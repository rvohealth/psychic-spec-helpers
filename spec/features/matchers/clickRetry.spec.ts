import { MouseClickOptions } from 'puppeteer'

// A panel that starts just off-screen to the right and slides into view over
// 500ms, as a shadcn/Radix Sheet does when it opens. Until it is on screen,
// its controls have no point a mouse can click. A click aims at a control's
// position when the click is sent, so a control moving faster than this could
// move out from under it; real sheets move about this fast.
function slidingPanel(content: string) {
  // The doctype keeps the page out of quirks mode, where the root element is
  // only as tall as its content and Puppeteer finds no point on screen to
  // click inside a fixed panel.
  return `<!doctype html>
    <style>
      #panel { position: fixed; top: 0; right: 0; width: 400px; height: 100%; transform: translateX(100%); transition: transform 500ms linear; }
      #panel.open { transform: translateX(0); }
      #panel > * { display: inline-block; width: 200px; }
    </style>
    <div id="panel">${content}</div>
    <script>
      requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById('panel').classList.add('open')))
    </script>
  `
}

const recordClick = `document.body.dataset.clicked = (Number(document.body.dataset.clicked || 0) + 1).toString()`

async function clickCount() {
  return Number(await page.evaluate('document.body.dataset.clicked || 0'))
}

describe('click matchers', () => {
  context('a target sliding into view', () => {
    it('toClickSelector clicks it', async () => {
      await page.setContent(
        slidingPanel(`<button id="save" onclick="${recordClick}">Save changes</button>`)
      )
      await expect(page).toClickSelector('#save', { timeout: 3000 })
      expect(await clickCount()).toEqual(1)
    })

    it('toClickButton clicks it', async () => {
      await page.setContent(slidingPanel(`<button onclick="${recordClick}">Save changes</button>`))
      await expect(page).toClickButton('Save changes', { timeout: 3000 })
      expect(await clickCount()).toEqual(1)
    })

    it('toClickLink clicks it', async () => {
      await page.setContent(
        slidingPanel(`<a href="#saved" onclick="${recordClick}">Save changes</a>`)
      )
      await expect(page).toClickLink('Save changes', { timeout: 3000 })
      expect(await clickCount()).toEqual(1)
    })

    it('toClick clicks it', async () => {
      await page.setContent(slidingPanel(`<span onclick="${recordClick}">Save changes</span>`))
      await expect(page).toClick('Save changes', { timeout: 3000 })
      expect(await clickCount()).toEqual(1)
    })

    it('toCheck clicks the label of a checkbox in it', async () => {
      await page.setContent(
        slidingPanel(
          '<label for="updates">Email me updates</label><input id="updates" type="checkbox">'
        )
      )
      await expect(page).toCheck('Email me updates', { timeout: 3000 })
      expect(await page.evaluate('document.getElementById("updates").checked')).toBe(true)
    })
  })

  context('a target replaced by a re-render while the click is on its way', () => {
    it('clicks the element that replaced it', async () => {
      await page.setContent(`
        <div id="host"></div>
        <script>
          const render = () => {
            document.getElementById('host').innerHTML = '<button id="go" onclick="${recordClick}">Go</button>'
          }
          render()
          const rerendering = setInterval(render, 0)
          setTimeout(() => clearInterval(rerendering), 500)
        </script>
      `)
      await expect(page).toClickSelector('#go', { timeout: 3000 })
      expect(await clickCount()).toEqual(1)
    })
  })

  context('an ARIA checkbox found by its accessible name that cannot be clicked yet', () => {
    // No label names it, so toCheck and toUncheck find it by its aria-label
    // after giving a label 3000ms to appear, and click the control itself.
    const hiddenUntilShown = (checked: boolean) => `
      <button id="updates" role="checkbox" aria-checked="${checked}" aria-label="Email me updates" style="display: none"
        onclick="this.setAttribute('aria-checked', this.getAttribute('aria-checked') === 'true' ? 'false' : 'true')">x</button>
      <script>setTimeout(() => { document.getElementById('updates').style.display = '' }, 3400)</script>
    `

    it('toCheck clicks it once it can be clicked', async () => {
      await page.setContent(hiddenUntilShown(false))
      await expect(page).toCheck('Email me updates', { timeout: 2000 })
      await expect(page).toHaveSelector('#updates[aria-checked="true"]', { timeout: 300 })
    })

    it('toUncheck clicks it once it can be clicked', async () => {
      await page.setContent(hiddenUntilShown(true))
      await expect(page).toUncheck('Email me updates')
      await expect(page).toHaveSelector('#updates[aria-checked="false"]', { timeout: 300 })
    })
  })

  context('a selector that never appears', () => {
    it('fails within the timeout, saying why', async () => {
      await page.setContent('<div>Nothing to click</div>')
      const start = Date.now()
      await expect(async () => {
        await expect(page).toClickSelector('#never', { timeout: 500 })
      }).rejects.toThrow(
        'Expected page to have clickable element with matching selector: "#never". Waiting for selector `#never` failed'
      )
      expect(Date.now() - start).toBeLessThan(1500)
    })
  })

  context('an element that never gets a point to click', () => {
    it('fails within the timeout, saying why', async () => {
      await page.setContent('<button id="hidden" style="display: none">Hidden</button>')
      const start = Date.now()
      await expect(async () => {
        await expect(page).toClickSelector('#hidden', { timeout: 500 })
      }).rejects.toThrow(
        'Expected page to have clickable element with matching selector: "#hidden". Node is either not clickable or not an Element'
      )
      expect(Date.now() - start).toBeLessThan(1500)
    })
  })

  context('toClickButton finding no button', () => {
    it('says it looked for a button', async () => {
      await page.setContent('<div>Nothing to click</div>')
      await expect(async () => {
        await expect(page).toClickButton('Save changes', { timeout: 300 })
      }).rejects.toThrow(
        'Expected page to have clickable button with matching text: "Save changes"'
      )
    })
  })

  context('a disabled button', () => {
    it('is clicked at once and nothing happens, as before', async () => {
      await page.setContent(
        `<button id="off" disabled onclick="${recordClick}">Turned off</button>`
      )
      const start = Date.now()
      await expect(page).toClickSelector('#off', { timeout: 3000 })
      await expect(page).toClickButton('Turned off', { timeout: 3000 })
      expect(Date.now() - start).toBeLessThan(1000)
      expect(await clickCount()).toEqual(0)
    })
  })

  context('a click that reaches the page and then fails', () => {
    function failAfterDispatch() {
      const dispatch = page.mouse.click.bind(page.mouse)
      return vi
        .spyOn(page.mouse, 'click')
        .mockImplementation(async (x: number, y: number, options?: Readonly<MouseClickOptions>) => {
          await dispatch(x, y, options)
          throw new Error('The click navigated away')
        })
    }

    it('is not clicked again, and the failure says why', async () => {
      await page.setContent(`<button id="go" onclick="${recordClick}">Go</button>`)
      const click = failAfterDispatch()
      try {
        await expect(async () => {
          await expect(page).toClickSelector('#go', { timeout: 2000 })
        }).rejects.toThrow(
          'Expected page to have clickable element with matching selector: "#go". The click navigated away'
        )
        expect(click).toHaveBeenCalledTimes(1)
      } finally {
        click.mockRestore()
      }
      expect(await clickCount()).toEqual(1)
    })

    it('is not clicked again when toCheck clicks a control found by its accessible name', async () => {
      await page.setContent(
        `<button id="updates" role="checkbox" aria-checked="false" aria-label="Email me updates" onclick="${recordClick}">x</button>`
      )
      const click = failAfterDispatch()
      try {
        await expect(async () => {
          await expect(page).toCheck('Email me updates', { timeout: 500 })
        }).rejects.toThrow('The click navigated away')
        expect(click).toHaveBeenCalledTimes(1)
      } finally {
        click.mockRestore()
      }
      expect(await clickCount()).toEqual(1)
    })
  })
})
