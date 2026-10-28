import { PsychicServer } from '@rvoh/psychic'
import supertest from 'supertest'
import {
  createPsychicServer,
  OpenapiSpecSession,
  specRequest as request,
  SpecSession,
} from '../../../src/index.js'
import { paths as openapiPaths } from '../../../test-app/src/types/openapi/openapi.js'

// SpecSession and OpenapiSpecSession are exported with public constructors that took
// a plain supertest agent before sessions bound their server to 127.0.0.1 per
// request. They still accept one, and use it as they always did.
describe('sessions built from a plain supertest agent', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('SpecSession makes requests with it', async () => {
    // eslint-disable-next-line
    const server = await createPsychicServer(PsychicServer)
    // eslint-disable-next-line
    const session = new SpecSession(supertest(server.koaApp.callback()))
    const res = await session.get('/spec-request/get-test', 200, { query: { a: 'a' } })
    expect(res.body).toEqual(expect.objectContaining({ query: { a: 'a' } }))
  })

  it('OpenapiSpecSession makes requests with it', async () => {
    // eslint-disable-next-line
    const server = await createPsychicServer(PsychicServer)
    // eslint-disable-next-line
    const session = new OpenapiSpecSession<openapiPaths>(supertest(server.koaApp.callback()))
    await session.get('/headers-test', 200)
  })
})
