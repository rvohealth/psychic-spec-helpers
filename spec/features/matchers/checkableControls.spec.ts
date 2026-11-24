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

  // An app wrapper such as `check(label, { timeout: opts?.timeout })` passes an
  // explicit undefined, which page.waitForSelector reads as the page's default
  // timeout, as these matchers always have.
  context('an explicit timeout: undefined is the page default timeout', () => {
    it('waits past 5000ms when the page default timeout is longer', async () => {
      expect(page.getDefaultTimeout()).toBeGreaterThan(6000)
      await page.setContent(
        `<label for="terms">Accept terms</label><div id="root"></div><script>setTimeout(() => { document.getElementById('root').innerHTML = '<input type="checkbox" id="terms" checked>' }, 5500)</script>`
      )
      await expect(page).toHaveChecked('Accept terms', { timeout: undefined })
    })

    context('when the page default timeout is shorter than 5000ms', () => {
      let defaultTimeout: number

      beforeEach(async () => {
        defaultTimeout = page.getDefaultTimeout()
        page.setDefaultTimeout(300)
        await page.setContent('<label for="missing">Accept terms</label>')
      })

      afterEach(() => {
        page.setDefaultTimeout(defaultTimeout)
      })

      const failsWithin = async (assertion: () => Promise<unknown>) => {
        const startedAt = Date.now()
        await expect(assertion).rejects.toThrow('missing')
        expect(Date.now() - startedAt).toBeLessThan(3000)
      }

      it('for toHaveChecked', async () => {
        await failsWithin(() => expect(page).toHaveChecked('Accept terms', { timeout: undefined }))
      })

      it('for toHaveUnchecked', async () => {
        await failsWithin(() =>
          expect(page).toHaveUnchecked('Accept terms', { timeout: undefined })
        )
      })

      it('for toCheck', async () => {
        await failsWithin(() => expect(page).toCheck('Accept terms', { timeout: undefined }))
      })

      it('for toUncheck', async () => {
        await failsWithin(() => expect(page).toUncheck('Accept terms', { timeout: undefined }))
      })
    })
  })

  // A signal aborts the wait for the control, as it always has: the matcher
  // fails promptly instead of retrying, even with no timeout.
  context('an aborted signal ends the wait with a failure', () => {
    const settlesWithin = async (assertion: Promise<unknown>, ms: number) => {
      const pending = Symbol('pending')
      const outcome = await Promise.race([
        assertion.then(
          () => 'passed',
          (error: Error) => error.message
        ),
        new Promise(resolve => setTimeout(() => resolve(pending), ms)),
      ])
      expect(outcome).not.toBe(pending)
      return outcome
    }

    for (const timeout of [0, 3000]) {
      context(`with { timeout: ${timeout} }`, () => {
        it('for toHaveChecked, while the control is missing', async () => {
          await page.setContent('<label for="missing">Accept terms</label>')
          const message = await settlesWithin(
            expect(page).toHaveChecked('Accept terms', {
              timeout,
              signal: AbortSignal.timeout(100),
            }),
            1500
          )
          expect(message).toContain('has for="missing", but no element has that id')
        })

        it('for toHaveUnchecked, while the control is still checked', async () => {
          await page.setContent(
            '<label for="terms">Accept terms</label><input type="checkbox" id="terms" checked>'
          )
          const message = await settlesWithin(
            expect(page).toHaveUnchecked('Accept terms', {
              timeout,
              signal: AbortSignal.timeout(100),
            }),
            1500
          )
          expect(message).toContain('but it was checked')
        })

        it('for toHaveChecked, while no control is labelled', async () => {
          await page.setContent('<p>Nothing to check</p>')
          const message = await settlesWithin(
            expect(page).toHaveChecked('Accept terms', {
              timeout,
              signal: AbortSignal.timeout(100),
            }),
            1500
          )
          expect(message).toContain('No label contains "Accept terms"')
        })

        // A signal that has aborted before the first read: the control the
        // page has is still the one reported.
        it('for toHaveChecked, while the control is missing, with a signal aborted already', async () => {
          await page.setContent('<label for="missing">Accept terms</label>')
          const message = await settlesWithin(
            expect(page).toHaveChecked('Accept terms', { timeout, signal: AbortSignal.abort() }),
            1500
          )
          expect(message).toContain('has for="missing", but no element has that id')
        })

        it('for toHaveUnchecked, while the control is still checked, with a signal aborted already', async () => {
          await page.setContent(
            '<label for="terms">Accept terms</label><input type="checkbox" id="terms" checked>'
          )
          const message = await settlesWithin(
            expect(page).toHaveUnchecked('Accept terms', { timeout, signal: AbortSignal.abort() }),
            1500
          )
          expect(message).toContain('but it was checked')
        })

        // A read begun after the abort reports the page but cannot pass: an
        // aborted wait has always ended with a failure.
        it('for toHaveChecked, while the control is already checked, with a signal aborted already', async () => {
          await page.setContent(
            '<label for="terms">Accept terms</label><input type="checkbox" id="terms" checked>'
          )
          const message = await settlesWithin(
            expect(page).toHaveChecked('Accept terms', { timeout, signal: AbortSignal.abort() }),
            1500
          )
          expect(message).toContain(
            'Expected page to have checked checkbox with text: "Accept terms"'
          )
          expect(message).not.toContain('no element has that id')
        })

        it('for toHaveUnchecked, while the control is already unchecked, with a signal aborted already', async () => {
          await page.setContent(
            '<label for="terms">Accept terms</label><input type="checkbox" id="terms">'
          )
          const message = await settlesWithin(
            expect(page).toHaveUnchecked('Accept terms', { timeout, signal: AbortSignal.abort() }),
            1500
          )
          expect(message).toContain(
            'Expected page to have unchecked checkbox with text: "Accept terms"'
          )
          expect(message).not.toContain('no element has that id')
        })
      })
    }

    it('still passes on a control in the expected state', async () => {
      await page.setContent(
        '<label for="terms">Accept terms</label><input type="checkbox" id="terms" checked>'
      )
      await expect(page).toHaveChecked('Accept terms', {
        timeout: 0,
        signal: AbortSignal.timeout(2000),
      })
    })
  })

  // After toUncheck clicks a control the fallback found, it reads that same
  // control until it is unchecked; only a control that left the page is looked
  // up again by its name, and only one that is gone for good counts as
  // unchecked.
  context('toUncheck on a control the fallback found, after the click', () => {
    const checkedTerms = (onclick: string) =>
      `<div id="root"><button type="button" role="checkbox" aria-checked="true" aria-label="Terms" id="terms"></button></div><script>document.getElementById('terms').addEventListener('click', () => { ${onclick} })</script>`

    it('fails when the control stays checked while another control with its name appears', async () => {
      await page.setContent(
        checkedTerms(
          `document.getElementById('root').insertAdjacentHTML('beforeend', '<button type="button" role="checkbox" aria-checked="true" aria-label="Terms" id="other"></button>')`
        )
      )
      await expect(async () => {
        await expect(page).toUncheck('Terms')
      }).rejects.toThrow('(button#terms[role="checkbox"]), but it is still checked')
    }, 15000)

    it('fails when the control stays checked while its name changes', async () => {
      await page.setContent(
        checkedTerms(`document.getElementById('terms').setAttribute('aria-label', 'Pending')`)
      )
      await expect(async () => {
        await expect(page).toUncheck('Terms')
      }).rejects.toThrow('(button#terms[role="checkbox"]), but it is still checked')
    }, 15000)

    it('fails, naming the controls, when it is replaced by more than one control with its name', async () => {
      await page.setContent(
        checkedTerms(
          `document.getElementById('root').innerHTML = '<button type="button" role="checkbox" aria-checked="true" aria-label="Terms" id="first"></button><button type="button" role="checkbox" aria-checked="true" aria-label="Terms" id="second"></button>'`
        )
      )
      await expect(async () => {
        await expect(page).toUncheck('Terms')
      }).rejects.toThrow(
        '2 controls are labelled "Terms": button#first[role="checkbox"], button#second[role="checkbox"]'
      )
    }, 15000)

    it('passes when the control is removed', async () => {
      await page.setContent(checkedTerms(`document.getElementById('terms').remove()`))
      await expect(page).toUncheck('Terms')
    })

    it('passes when a re-render replaces the control with an unchecked one', async () => {
      await page.setContent(
        checkedTerms(
          `document.getElementById('root').innerHTML = '<button type="button" role="checkbox" aria-checked="false" aria-label="Terms" id="terms"></button>'`
        )
      )
      await expect(page).toUncheck('Terms')
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
      }).rejects.toThrow(
        'but it has no for attribute (or a blank one),\nand no checkbox, radio or switch is labelled "Accept terms"'
      )
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
  // What the failure says when the text resolves no control.
  context('failure messages', () => {
    it('toCheck and toUncheck name both helpers and say the label has no for attribute', async () => {
      await page.setContent('<label>Accept terms</label><input type="checkbox" id="terms">')
      await expect(async () => {
        await expect(page).toCheck('Accept terms', { timeout: 300 })
      }).rejects.toThrow(
        'When using our check and uncheck helpers, we expect you to have a semantic layout for a checkbox on your page,\nsuch as the following:'
      )

      await page.setContent('<label>Accept terms</label><input type="checkbox" id="terms" checked>')
      await expect(async () => {
        await expect(page).toUncheck('Accept terms', { timeout: 300 })
      }).rejects.toThrow(
        'but it has no for attribute (or a blank one),\nand no checkbox, radio or switch is labelled "Accept terms"'
      )
    }, 15000)

    it('toCheck says a for attribute that is not valid CSS cannot be used, when an element has that id', async () => {
      await page.setContent('<label for=":r0:">Accept terms</label><input type="text" id=":r0:">')
      await expect(async () => {
        await expect(page).toCheck('Accept terms', { timeout: 300 })
      }).rejects.toThrow(
        'but ":r0:" is not usable as a CSS id selector, and no checkbox, radio or switch is labelled "Accept terms".\n\nfor attribute found: ":r0:"\n\nMake sure you have a checkbox, radio or switch with an id matching ":r0:"'
      )
    }, 15000)

    it('toCheck says it could not locate the element its label names', async () => {
      await page.setContent('<label for="missing">Accept terms</label>')
      await expect(async () => {
        await expect(page).toCheck('Accept terms', { timeout: 300 })
      }).rejects.toThrow(
        'but we could not locate that input element.\n\nfor attribute found: "missing"\n\nMake sure you have an input element with an id matching "missing"'
      )
    })

    it('toCheck names the visible option when the element its label names is hidden', async () => {
      await page.setContent(
        '<label for="terms">Accept terms</label><input type="checkbox" id="terms" style="display:none">'
      )
      await expect(async () => {
        await expect(page).toCheck('Accept terms', { visible: true, timeout: 300 })
      }).rejects.toThrow(
        'but we could not locate a visible element with that id.\n\nfor attribute found: "terms"\n\nMake sure you have a visible input element with an id matching "terms"'
      )
    })

    it('toHaveChecked names the visible option when the element its label names is hidden', async () => {
      await page.setContent(
        '<label for="terms">Accept terms</label><input type="checkbox" id="terms" checked style="display:none">'
      )
      await expect(async () => {
        await expect(page).toHaveChecked('Accept terms', { visible: true, timeout: 300 })
      }).rejects.toThrow(
        'The first label containing "Accept terms" has for="terms", but no visible element has that id'
      )
    })

    it('toHaveChecked names the hidden option when the element its label names is visible', async () => {
      await page.setContent(
        '<label for="terms">Accept terms</label><input type="checkbox" id="terms" checked>'
      )
      await expect(async () => {
        await expect(page).toHaveChecked('Accept terms', { hidden: true, timeout: 300 })
      }).rejects.toThrow(
        'The first label containing "Accept terms" has for="terms", but no hidden element has that id'
      )
    })

    it('toHaveChecked says the text is in a child element of the label, which has no for attribute', async () => {
      await page.setContent('<label for="missing"><span>Accept terms</span></label>')
      await expect(async () => {
        await expect(page).toHaveChecked('Accept terms', { timeout: 300 })
      }).rejects.toThrow(
        'The first label containing "Accept terms" holds it in a child element, which has no for attribute, and no checkbox, radio or switch is labelled "Accept terms"'
      )
    })
  })
})
