import { PsychicServer } from '@rvoh/psychic'
import http from 'node:http'
import net from 'node:net'
import { OpenapiSpecRequest, specRequest } from '../../src/index.js'
import { paths as openapiPaths } from '../../test-app/src/types/openapi/openapi.js'

const openapiRequest = new OpenapiSpecRequest<openapiPaths>()

// On macOS the kernel lets a wildcard `listen(0)` take a port that another
// process holds on 127.0.0.1 only, and a connection to 127.0.0.1:<port> then
// reaches that other process. supertest binds with `listen(0)` and connects to
// 127.0.0.1, so a spec request could get another local process's response.
//
// These specs force that collision: an impostor holds a loopback-only port,
// and every wildcard `listen(0)` is steered onto it. On macOS the steered bind
// succeeds and the request reaches the impostor; on Linux it fails with
// EADDRINUSE. Either way the request fails unless the spec helpers bind the
// app's server to 127.0.0.1 themselves.
describe('spec requests when another process holds a loopback-only port', () => {
  let impostor: http.Server

  beforeEach(async () => {
    await specRequest.init(PsychicServer)
    await openapiRequest.init(PsychicServer)

    impostor = http.createServer((_req, res) => {
      res.statusCode = 418
      res.end('impostor')
    })
    await new Promise<void>(resolve => impostor.listen(0, '127.0.0.1', resolve))
    const impostorPort = (impostor.address() as net.AddressInfo).port

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalListen = net.Server.prototype.listen
    vi.spyOn(net.Server.prototype, 'listen').mockImplementation(function (
      this: net.Server,
      ...args: unknown[]
    ) {
      const wildcardEphemeral =
        args[0] === 0 && (args.length === 1 || typeof args[1] === 'function')
      if (wildcardEphemeral) args[0] = impostorPort
      return originalListen.apply(this, args as Parameters<net.Server['listen']>)
    })
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await new Promise<void>(resolve => impostor.close(() => resolve()))
  })

  it('specRequest reaches the app under test', async () => {
    const res = await specRequest.get('/spec-request/get-test', 200, { query: { a: 'a' } })
    expect(res.body).toEqual(expect.objectContaining({ query: { a: 'a' } }))
  })

  it('specRequest sessions reach the app under test for every request', async () => {
    const session = await specRequest.session('spec-session/start-session', 204, {
      data: { password: 'goodpass' },
    })
    await session.get('spec-session/auth-test', 204)
    await session.get('spec-session/auth-test', 204)
  })

  it('OpenapiSpecRequest reaches the app under test', async () => {
    const res = await openapiRequest.get('/headers-test', 200, { headers: { hello: 'world' } })
    expect(res.body).toEqual(expect.objectContaining({ hello: 'world' }))
  })

  it('OpenapiSpecRequest sessions reach the app under test for every request', async () => {
    const session = await openapiRequest.session('post', '/spec-session/start-session', 204, {
      data: { password: 'goodpass' },
    })
    await session.get('/spec-session/auth-test', 204)
    await session.get('/spec-session/auth-test', 204)
  })

  it('closes the server it bound for each request', async () => {
    const before = await openConnectionsCount()
    await specRequest.get('/spec-request/get-test', 200)
    await openapiRequest.get('/headers-test', 200)
    const session = await specRequest.session('spec-session/start-session', 204, {
      data: { password: 'goodpass' },
    })
    await session.get('spec-session/auth-test', 204)
    expect(await openConnectionsCount()).toEqual(before)
  })
})

async function openConnectionsCount() {
  // let pending close callbacks run
  await new Promise(resolve => setImmediate(resolve))
  return (process as unknown as { _getActiveHandles(): unknown[] })
    ._getActiveHandles()
    .filter(handle => handle instanceof net.Server && handle.listening).length
}
