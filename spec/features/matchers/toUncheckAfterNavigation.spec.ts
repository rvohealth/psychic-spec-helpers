import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http'
import { AddressInfo } from 'node:net'

// toUncheck on a control the fallback finds (no label with a for), when the
// click navigates the page. The control the click reached left with the old
// page, so the next page is read by the control's name: unchecked or gone
// passes, still checked fails.

const pages: Record<string, string> = {
  // A filter checkbox in a wrapping label that submits its GET form.
  '/filters?archived=1':
    '<form method="get" action="/filters"><label><input type="checkbox" name="archived" value="1" checked onchange="this.form.submit()"> Show archived</label></form>',
  '/filters':
    '<form method="get" action="/filters"><label><input type="checkbox" name="archived" value="1" onchange="this.form.submit()"> Show archived</label></form>',
  // An ARIA checkbox whose click goes to a page without it.
  '/terms':
    '<button type="button" role="checkbox" aria-checked="true" aria-label="Terms" onclick="location.href=\'/done\'"></button>',
  '/done': '<p>Done</p>',
  // An ARIA checkbox whose click goes to a page that still has it checked.
  '/stays':
    '<button type="button" role="checkbox" aria-checked="true" aria-label="Terms" onclick="location.href=\'/stays-checked\'"></button>',
  '/stays-checked':
    '<button type="button" role="checkbox" aria-checked="true" aria-label="Terms"></button>',
}

describe('toUncheck when the click navigates', () => {
  let server: Server
  let origin: string

  beforeAll(async () => {
    server = createServer((req: IncomingMessage, res: ServerResponse) => {
      // A form submitted with nothing checked requests /filters?, which is /filters.
      const url = new URL(req.url ?? '/', 'http://localhost')
      const body = pages[url.pathname + url.search]
      res.writeHead(body === undefined ? 404 : 200, { 'Content-Type': 'text/html' })
      res.end(`<!doctype html><html><body>${body ?? 'Not found'}</body></html>`)
    })
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })

  afterAll(async () => {
    await new Promise<void>(resolve => server.close(() => resolve()))
  })

  it('passes when a wrapping-label checkbox submits its form and the next page has it unchecked', async () => {
    await page.goto(`${origin}/filters?archived=1`)
    await expect(page).toUncheck('Show archived')
    await expect(page).toHaveUnchecked('Show archived')
  })

  it('passes when an ARIA checkbox navigates to a page without it', async () => {
    await page.goto(`${origin}/terms`)
    await expect(page).toUncheck('Terms')
    await expect(page).toMatchTextContent('Done')
  })

  it('fails when the next page has the control still checked', async () => {
    await page.goto(`${origin}/stays`)
    await expect(expect(page).toUncheck('Terms')).rejects.toThrow(
      /^Clicked the checkable element with text: "Terms".*, but it is still checked$/
    )
    await expect(page).toHaveChecked('Terms')
  })
})
