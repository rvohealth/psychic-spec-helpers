import { Response } from 'supertest'
import supersession, { HttpMethod } from './supersession.js'

// like SpecRequest, but meant to be bound to an instance
// of supersession, enabling chained requests to collect cookies
export class SpecSession {
  constructor(private _session: ReturnType<typeof supersession>) {}

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

  private async makeRequest(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    uri: string,
    expectedStatus: number,
    opts: SpecRequestOptsAll = {}
  ) {
    if (expectedStatus === 500) {
      process.env.PSYCHIC_EXPECTING_INTERNAL_SERVER_ERROR = '1'
    }

    const req = this._session
    let request = req[method](`/${uri.replace(/^\//, '')}`)
    if (opts.headers) request = request.set(opts.headers)
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
  }
}

export interface SpecRequestOptsAll extends SpecRequestOpts {
  query?: Record<string, unknown>
  data?: Record<string, unknown>
}

export interface SpecRequestOptsGet extends SpecRequestOpts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query?: any
}

export interface SpecRequestOptsPost extends SpecRequestOpts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
}

export interface SpecRequestOpts {
  headers?: Record<string, string>
  allowMocks?: boolean
}

export interface SpecRequestSessionOpts extends SpecRequestOptsAll {
  httpMethod?: HttpMethod
}
