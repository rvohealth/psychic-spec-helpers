import { Response } from 'supertest'
import { SpecRequestOptsAll, SpecRequestOptsGet, SpecRequestOptsPost } from './SpecRequest.js'
import supersession from './supersession.js'

// like SpecRequest, but meant to be bound to an instance
// of supersession, enabling chained requests to collect cookies
export class SpecSession {
  private _defaultHeaders: Record<string, string>

  constructor(private _session: ReturnType<typeof supersession>) {}

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
  }
}
