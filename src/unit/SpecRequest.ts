import http from 'node:http'
import supertest, { Response } from 'supertest'
import { createPsychicServer } from '../index.js'
import { closeServer, listenOnLoopback } from './helpers/loopbackServer.js'
import supersession, { HttpMethod } from './supersession.js'
import { SpecSession } from './SpecSession.js'

export class SpecRequest {
  // eslint-disable-next-line
  private PsychicServer: any
  // eslint-disable-next-line
  private server: any

  private _defaultHeaders: Record<string, string>
  public setDefaultHeaders(headers: Record<string, string>) {
    this._defaultHeaders = headers
    return this
  }

  public async get(
    uri: string,
    expectedStatus: number,
    opts: SpecRequestOptsGet = {}
  ): Promise<Response> {
    return await this.makeRequest('get', uri, expectedStatus, opts as SpecRequestOptsAll)
  }

  public async post(
    uri: string,
    expectedStatus: number,
    opts: SpecRequestOptsPost = {}
  ): Promise<Response> {
    return await this.makeRequest('post', uri, expectedStatus, opts as SpecRequestOptsAll)
  }

  public async put(
    uri: string,
    expectedStatus: number,
    opts: SpecRequestOptsPost = {}
  ): Promise<Response> {
    return await this.makeRequest('put', uri, expectedStatus, opts as SpecRequestOptsAll)
  }

  public async patch(
    uri: string,
    expectedStatus: number,
    opts: SpecRequestOptsPost = {}
  ): Promise<Response> {
    return await this.makeRequest('patch', uri, expectedStatus, opts as SpecRequestOptsAll)
  }

  public async delete(
    uri: string,
    expectedStatus: number,
    opts: SpecRequestOptsPost = {}
  ): Promise<Response> {
    return await this.makeRequest('delete', uri, expectedStatus, opts as SpecRequestOptsAll)
  }

  // eslint-disable-next-line
  public async init(PsychicServer: any) {
    // eslint-disable-next-line
    this.PsychicServer = PsychicServer
    this.server ||= await createPsychicServer(PsychicServer)
  }

  public async session(
    uri: string,
    expectedStatus: number,
    opts: SpecRequestSessionOpts = {}
  ): Promise<SpecSession> {
    // eslint-disable-next-line
    const server = await createPsychicServer(this.PsychicServer)
    const session = supersession(server)

    await session.listen()
    try {
      let req = session[opts.httpMethod || 'post'](`/${uri.replace(/^\//, '')}`)

      if (opts.data) {
        req = req.send(opts.data)
      }

      await req
        .expect(expectedStatus)
        .query(opts.query || {})
        .set({ ...this._defaultHeaders, ...opts.headers })
    } finally {
      await session.close()
    }

    return new SpecSession(session).setDefaultHeaders(this._defaultHeaders)
  }

  private async makeRequest(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    uri: string,
    expectedStatus: number,
    opts: SpecRequestOptsAll = {}
  ) {
    // TODO: find out why this is necessary. Currently, without initializing the server
    // at the beginning of the specs, supertest is unable to use our server to handle requests.
    // it gives the appearance of being an issue with a runaway promise (i.e. missing await)
    // but I can't find it anywhere, so I am putting this init method in as a temporary fix.
    if (!this.server)
      throw new Error(
        `
  ERROR:
    When making use of the send spec helper, you must first call "await specRequest.init(PsychicServer)"
    from a beforEach hook at the root of your specs.
`
      )

    if (expectedStatus === 500) {
      process.env.PSYCHIC_EXPECTING_INTERNAL_SERVER_ERROR = '1'
    }

    // eslint-disable-next-line
    const server = http.createServer(this.server.koaApp.callback())
    await listenOnLoopback(server)

    try {
      const req = supertest.agent(server)
      let request = req[method](`/${uri.replace(/^\//, '')}`)
      request = request.set({ ...this._defaultHeaders, ...opts.headers })
      if (opts.query) request = request.query(opts.query)
      if (method !== 'get') request = request.send(opts.data)

      try {
        const res = await request.expect(expectedStatus)
        process.env.PSYCHIC_EXPECTING_INTERNAL_SERVER_ERROR = undefined
        return res
      } catch (err) {
        // without manually console logging, you get no stack trace here
        console.error(err)
        console.trace()

        process.env.PSYCHIC_EXPECTING_INTERNAL_SERVER_ERROR = undefined

        throw err
      }
    } finally {
      await closeServer(server)
    }
  }
}

export interface SpecRequestOptsAll extends SpecRequestOpts {
  query?: object
  data?: object
}

export interface SpecRequestOptsGet extends SpecRequestOpts {
  query?: object
}

export interface SpecRequestOptsPost extends SpecRequestOpts {
  data?: object
}

export interface SpecRequestOpts {
  headers?: Record<string, string>
  allowMocks?: boolean
}

export interface SpecRequestSessionOpts extends SpecRequestOptsAll {
  httpMethod?: HttpMethod
}

export default new SpecRequest()
