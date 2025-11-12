import { Dream, DreamApp } from '@rvoh/dream'
import { provideDreamViteMatchers, truncate } from '@rvoh/dream-spec-helpers'
import { PsychicServer } from '@rvoh/psychic'
import { providePuppeteerViteMatchers } from '../../../src/index.js'
import initializePsychicApp from '../../../test-app/src/cli/helpers/initializePsychicApp.js'
import getPage from '../helpers/getPage.js'

provideDreamViteMatchers(Dream)
providePuppeteerViteMatchers()

// vi.setTimeout(
//   (process.env.JEST_FEATURE_TIMEOUT_SECONDS && parseInt(process.env.JEST_FEATURE_TIMEOUT_SECONDS) * 1000) ||
//     125000,
// )

// define global context variable, setting it equal to describe
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(global as any).context = describe

// this is done so that the `@jest-mock/express` library can continue
// to function. Since jest and vi have near parity, this seems to work,
// though it is very hacky, and we should eventually back out of it.
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(global as any).jest = vi

let server: PsychicServer

beforeAll(async () => {
  await initializePsychicApp()

  server = new PsychicServer()
  await server.start(parseInt(process.env.DEV_SERVER_PORT || '7778'))

  // Initialize with first page from shared browser
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ;(global as any).page = await getPage()
})

beforeEach(async () => {
  // Automatically ensure we have a valid page reference before every test
  // This handles cases where the page might have been closed or become stale
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  const currentPage = (global as any).page

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  if (!currentPage || currentPage.isClosed()) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    ;(global as any).page = await getPage()
  }

  await truncate(DreamApp)

  await visit('/')
  await expect(page).toMatchTextContent('My div', { timeout: 10000 })
}, 15000)

afterAll(async () => {
  await server.stop()
})
