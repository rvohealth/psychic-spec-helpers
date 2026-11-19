// toHaveChecked, toHaveUnchecked, toCheck and toUncheck on native and
// Radix-shaped controls, and how they find a control by its text.

// Radix renders a checkbox, radio or switch as a button with a role and
// aria-checked (no checked property); inside a form it adds a hidden "bubble"
// input that carries the name but no id. These scripts stand in for its
// click handlers.
const radixScript = `<script>
document.querySelectorAll('button[role=checkbox], button[role=switch]').forEach(button => {
  button.addEventListener('click', () => {
    const next = button.getAttribute('aria-checked') !== 'true'
    button.setAttribute('aria-checked', String(next))
    button.setAttribute('data-state', next ? 'checked' : 'unchecked')
    const bubble = button.parentElement.querySelector('input[aria-hidden]')
    if (bubble) bubble.checked = next
  })
})
document.querySelectorAll('button[role=radio]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('button[role=radio]').forEach(other => {
      other.setAttribute('aria-checked', String(other === button))
      other.setAttribute('data-state', other === button ? 'checked' : 'unchecked')
    })
  })
})
</script>`

const bubble =
  '<input type="checkbox" aria-hidden="true" tabindex="-1" name="terms" style="position:absolute;pointer-events:none;opacity:0;margin:0;transform:translateX(-100%)">'

type Fixture = { name: string; html: string; text: string; toggles: boolean }

// Each starts unchecked. toggles is false for radios: clicking a checked
// radio leaves it checked.
const controls: Fixture[] = [
  {
    name: 'native checkbox',
    html: '<label for="terms">Accept terms</label><input type="checkbox" id="terms">',
    text: 'Accept terms',
    toggles: true,
  },
  {
    name: 'native radio',
    html: '<input type="radio" name="size" id="small"><label for="small">Small size</label><input type="radio" name="size" id="large"><label for="large">Large size</label>',
    text: 'Small size',
    toggles: false,
  },
  {
    name: 'native switch',
    html: '<label for="dark">Dark mode</label><input type="checkbox" role="switch" id="dark">',
    text: 'Dark mode',
    toggles: true,
  },
  {
    name: 'Radix checkbox',
    html: `<label for="terms">Accept terms</label><button type="button" role="checkbox" aria-checked="false" data-state="unchecked" id="terms"></button>${radixScript}`,
    text: 'Accept terms',
    toggles: true,
  },
  {
    name: 'Radix checkbox with a bubble input',
    html: `<form><label for="terms">Accept terms</label><button type="button" role="checkbox" aria-checked="false" data-state="unchecked" id="terms"></button>${bubble}</form>${radixScript}`,
    text: 'Accept terms',
    toggles: true,
  },
  {
    name: 'Radix radio',
    html: `<div role="radiogroup"><button type="button" role="radio" aria-checked="false" id="small"></button><label for="small">Small size</label><button type="button" role="radio" aria-checked="false" id="large"></button><label for="large">Large size</label></div>${radixScript}`,
    text: 'Small size',
    toggles: false,
  },
  {
    name: 'Radix switch',
    html: `<label for="dark">Dark mode</label><button type="button" role="switch" aria-checked="false" data-state="unchecked" id="dark"></button>${radixScript}`,
    text: 'Dark mode',
    toggles: true,
  },
  {
    name: 'Radix switch with a bubble input',
    html: `<form><label for="dark">Dark mode</label><button type="button" role="switch" aria-checked="false" data-state="unchecked" id="dark"></button>${bubble}</form>${radixScript}`,
    text: 'Dark mode',
    toggles: true,
  },
]

describe('checked matchers', () => {
  for (const control of controls) {
    context(`on a ${control.name}`, () => {
      beforeEach(async () => {
        await page.setContent(control.html)
      })

      it('reads the unchecked state', async () => {
        await expect(page).toHaveUnchecked(control.text, { timeout: 300 })
        await expect(async () => {
          await expect(page).toHaveChecked(control.text, { timeout: 300 })
        }).rejects.toThrow('but it was not checked: it is unchecked')
      })

      it('checks it, and leaves a checked control checked', async () => {
        await expect(page).toCheck(control.text)
        await expect(page).toHaveChecked(control.text, { timeout: 300 })
        await expect(async () => {
          await expect(page).toHaveUnchecked(control.text, { timeout: 300 })
        }).rejects.toThrow('but it was checked')

        await expect(page).toCheck(control.text)
        await expect(page).toHaveChecked(control.text, { timeout: 300 })
      })

      it('passes toUncheck without clicking when it is already unchecked', async () => {
        await expect(page).toUncheck(control.text)
        await expect(page).toHaveUnchecked(control.text, { timeout: 300 })
      })

      if (control.toggles) {
        it('unchecks it', async () => {
          await expect(page).toCheck(control.text)
          await expect(page).toUncheck(control.text)
          await expect(page).toHaveUnchecked(control.text, { timeout: 300 })
        })
      }
    })
  }

  context('a mixed (aria-checked="mixed") control', () => {
    beforeEach(async () => {
      await page.setContent(
        '<label for="all">Select all</label><button type="button" role="checkbox" aria-checked="mixed" id="all"></button>'
      )
    })

    it('is neither checked nor unchecked', async () => {
      await expect(async () => {
        await expect(page).toHaveChecked('Select all', { timeout: 300 })
      }).rejects.toThrow('it is mixed')
      await expect(async () => {
        await expect(page).toHaveUnchecked('Select all', { timeout: 300 })
      }).rejects.toThrow('but it was mixed')
    })
  })

  it('counts an element with neither a checked property nor aria-checked as unchecked', async () => {
    await page.setContent('<label for="plain">Plain thing</label><div id="plain"></div>')
    await expect(page).toHaveUnchecked('Plain thing', { timeout: 300 })
    await expect(async () => {
      await expect(page).toHaveChecked('Plain thing', { timeout: 300 })
    }).rejects.toThrow('it is unchecked')
  })

  context('waiting for the state', () => {
    it('toHaveChecked waits for a control checked after the assertion starts', async () => {
      await page.setContent(
        `<label for="terms">Accept terms</label><button type="button" role="checkbox" aria-checked="false" id="terms"></button><script>setTimeout(() => document.getElementById('terms').setAttribute('aria-checked', 'true'), 300)</script>`
      )
      await expect(page).toHaveChecked('Accept terms', { timeout: 2000 })
    })

    it('toHaveUnchecked waits for a control unchecked after the assertion starts', async () => {
      await page.setContent(
        `<label for="terms">Accept terms</label><input type="checkbox" id="terms" checked><script>setTimeout(() => { document.getElementById('terms').checked = false }, 300)</script>`
      )
      await expect(page).toHaveUnchecked('Accept terms', { timeout: 2000 })
    })

    it('toHaveChecked waits for a label rendered after the assertion starts', async () => {
      await page.setContent(
        `<div id="root"></div><script>setTimeout(() => { document.getElementById('root').innerHTML = '<label for="terms">Accept terms</label><input type="checkbox" id="terms" checked>' }, 300)</script>`
      )
      await expect(page).toHaveChecked('Accept terms', { timeout: 2000 })
    })

    it('names the control and its state when the timeout passes', async () => {
      await page.setContent(
        '<label for="terms">Accept terms</label><input type="checkbox" id="terms">'
      )
      await expect(async () => {
        await expect(page).toHaveChecked('Accept terms', { timeout: 300 })
      }).rejects.toThrow(
        'Found element with text: Accept terms (input#terms[type="checkbox"]), but it was not checked: it is unchecked'
      )
    })
  })

  // A change at 4300ms passes with the 5000ms default and would fail with
  // evaluateWithRetryAndTimeout's 4000ms one.
  context('the default timeout is 5000ms', () => {
    it('for toHaveChecked', async () => {
      await page.setContent(
        `<label for="terms">Accept terms</label><input type="checkbox" id="terms"><script>setTimeout(() => { document.getElementById('terms').checked = true }, 4300)</script>`
      )
      await expect(page).toHaveChecked('Accept terms')
    })

    it('for toHaveUnchecked', async () => {
      await page.setContent(
        `<label for="terms">Accept terms</label><input type="checkbox" id="terms" checked><script>setTimeout(() => { document.getElementById('terms').checked = false }, 4300)</script>`
      )
      await expect(page).toHaveUnchecked('Accept terms')
    })

    const lateControl = (checked: boolean) =>
      `<label for="terms">Accept terms</label><div id="root"></div><script>setTimeout(() => { document.getElementById('root').innerHTML = '<input type="checkbox" id="terms"${checked ? ' checked' : ''}>' }, 4300)</script>`

    it('for toCheck', async () => {
      await page.setContent(lateControl(false))
      await expect(page).toCheck('Accept terms')
      await expect(page).toHaveChecked('Accept terms', { timeout: 300 })
    })

    it('for toUncheck', async () => {
      await page.setContent(lateControl(true))
      await expect(page).toUncheck('Accept terms')
      await expect(page).toHaveUnchecked('Accept terms', { timeout: 300 })
    })
  })

  context('finding the control by its text', () => {
    it('follows a label whose text is inside a child element', async () => {
      await check('My other checkbox')
      await expect(page).toHaveChecked('My other checkbox', { timeout: 300 })
      await uncheck('My other checkbox')
      await expect(page).toHaveUnchecked('My other checkbox', { timeout: 300 })
    })

    it('follows a for attribute naming a React 18 useId id', async () => {
      await page.setContent(
        '<label for=":r0:-form-item">Accept terms</label><input type="checkbox" id=":r0:-form-item" checked>'
      )
      await expect(page).toHaveChecked('Accept terms', { timeout: 300 })
      await expect(page).toUncheck('Accept terms')
      await expect(page).toHaveUnchecked('Accept terms', { timeout: 300 })
    })

    it('finds a control in a wrapping label', async () => {
      await page.setContent('<label><input type="checkbox" id="wrapped"> Wrapped option</label>')
      await expect(page).toHaveUnchecked('Wrapped option', { timeout: 300 })
      await expect(page).toCheck('Wrapped option')
      await expect(page).toHaveChecked('Wrapped option', { timeout: 300 })
      await expect(page).toUncheck('Wrapped option')
      await expect(page).toHaveUnchecked('Wrapped option', { timeout: 300 })
    })

    it('finds a Radix control in a wrapping label, not its bubble input', async () => {
      await page.setContent(
        `<form><label><button type="button" role="checkbox" aria-checked="false" id="terms"></button>${bubble} Accept terms</label></form>${radixScript}`
      )
      await expect(page).toCheck('Accept terms')
      await expect(page).toHaveChecked('Accept terms', { timeout: 300 })
    })

    it('finds a control by aria-label, ignoring case and extra whitespace, and clicks it', async () => {
      await page.setContent(
        `<button type="button" role="switch" aria-checked="false" aria-label="Dark  mode" id="dark"></button>${radixScript}`
      )
      await expect(page).toHaveUnchecked('dark mode', { timeout: 300 })
      await expect(page).toCheck('DARK MODE')
      await expect(page).toHaveChecked('dark mode', { timeout: 300 })
    })

    it('finds a control by aria-labelledby', async () => {
      await page.setContent(
        '<span id="alerts-label">Email alerts</span><button type="button" role="checkbox" aria-checked="true" aria-labelledby="alerts-label"></button>'
      )
      await expect(page).toHaveChecked('email alerts', { timeout: 300 })
    })

    it('fails, naming the controls, when more than one control matches', async () => {
      await page.setContent(
        '<button type="button" role="checkbox" aria-checked="true" aria-label="Notify by email" id="email"></button><button type="button" role="checkbox" aria-checked="true" aria-label="Notify by email digest" id="digest"></button>'
      )
      await expect(async () => {
        await expect(page).toHaveChecked('notify by email', { timeout: 300 })
      }).rejects.toThrow(
        '2 controls are labelled "notify by email": button#email[role="checkbox"], button#digest[role="checkbox"]'
      )
      await expect(async () => {
        await expect(page).toCheck('notify by email', { timeout: 300 })
      }).rejects.toThrow('2 controls are labelled')
    })

    it('keeps the label tier decisive over the fallback', async () => {
      await page.setContent(
        '<label for="first">Email</label><input type="checkbox" id="first" checked><button type="button" role="checkbox" aria-checked="false" aria-label="Email"></button>'
      )
      await expect(page).toHaveChecked('Email', { timeout: 300 })
    })

    it('lets toCheck wait for a late label before falling back', async () => {
      await page.setContent(
        `<button type="button" role="checkbox" aria-checked="false" aria-label="Accept terms" id="other"></button><div id="root"></div>${radixScript}<script>setTimeout(() => { document.getElementById('root').innerHTML = '<label for="terms">Accept terms</label><input type="checkbox" id="terms">' }, 500)</script>`
      )
      await expect(page).toCheck('Accept terms')
      await expect(page).toHaveChecked('Accept terms', { timeout: 300 })
      await expect(page).toHaveSelector('#other[aria-checked="false"]', { timeout: 300 })
    })

    it('still fails when the label points at a missing element', async () => {
      await page.setContent(
        '<label for="missing">Accept terms</label><button type="button" role="checkbox" aria-checked="true" aria-label="Accept terms"></button>'
      )
      await expect(async () => {
        await expect(page).toHaveChecked('Accept terms', { timeout: 300 })
      }).rejects.toThrow('has for="missing", but no element has that id')
    })

    it('still fails for a label without a for attribute beside its input', async () => {
      await page.setContent('<label>Accept terms</label><input type="checkbox" id="terms" checked>')
      await expect(async () => {
        await expect(page).toHaveChecked('Accept terms', { timeout: 300 })
      }).rejects.toThrow('has no for attribute')
      await expect(async () => {
        await expect(page).toCheck('Accept terms', { timeout: 300 })
      }).rejects.toThrow('the for attribute found on it')
    })

    it('fails when nothing names the control', async () => {
      await page.setContent(
        '<label for="terms">Accept terms</label><input type="checkbox" id="terms">'
      )
      await expect(async () => {
        await expect(page).toHaveUnchecked('Decline terms', { timeout: 300 })
      }).rejects.toThrow('No label contains "Decline terms"')
    })
  })
})
