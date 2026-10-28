import { CookieAccessInfo as CookieAccess } from 'cookiejar'
import http from 'http'
import request from 'supertest'
import URL, { UrlWithStringQuery } from 'url'
import { closeServer, listenOnLoopback } from './helpers/loopbackServer.js'

// NOTE: this is not original code.
// it was adapted from a non-typescript library with an uncertain future:
//
// https://github.com/rjz/supertest-session/blob/master/index.js

type AgentOptions = Parameters<typeof request.agent>[1]

export class Supersession {
  private app: http.Server
  private agent: ReturnType<typeof request.agent>
  private url: UrlWithStringQuery
  private cookieAccess: CookieAccess
  private activeRequests = 0
  private listening: Promise<void> = Promise.resolve()
  private closing: Promise<void> = Promise.resolve()

  constructor(
    // eslint-disable-next-line
    server: any,
    // not `options`: that name is the HTTP OPTIONS method below
    private agentOptions: AgentOptions = {}
  ) {
    // eslint-disable-next-line
    if (!server.koaApp) {
      throw new Error('Supersession requires a Koa `app`')
    }

    // eslint-disable-next-line
    this.app = http.createServer(server.koaApp.callback())
    // requests go to 127.0.0.1 on whichever port listen() binds; cookies match
    // on host and path, not port
    this.url = URL.parse('http://127.0.0.1/')

    this.reset()

    // typescript is telling me I don't need to worry about agentOptions.helpers,
    // but leaving this commented out in case we need to revisit
    // if (this.agentOptions.helpers instanceof Object) {
    //   assign(this, this.agentOptions.helpers)
    // }
  }

  get cookies() {
    // eslint-disable-next-line
    return (this.agent as any).jar.getCookies(this.cookieAccess)
  }

  public reset() {
    // Unset supertest-session options before forwarding options to superagent.
    const agentOptions = {
      ...this.agentOptions,
      before: undefined,
      cookieAccess: undefined,
      destroy: undefined,
      helpers: undefined,
    }

    this.agent = request.agent(this.app, agentOptions)

    const domain = this.url.hostname
    const path = this.url.path
    const secure = 'https:' == this.url.protocol
    const script = false
    // eslint-disable-next-line
    this.cookieAccess = (CookieAccess as any)(domain, path, secure, script)
  }

  destroy() {
    // eslint-disable-next-line
    if ((this.agentOptions as any).destroy) (this.agentOptions as any).destroy.call(this)
    this.reset()
  }

  /**
   * Binds the session's server to an ephemeral port on 127.0.0.1. Await this
   * before building a request and call close() once it has finished; a session
   * holds its port only while requests are in flight.
   */
  async listen() {
    this.activeRequests++
    if (this.activeRequests === 1) {
      const closing = this.closing
      this.listening = closing.then(() => listenOnLoopback(this.app))
    }
    await this.listening
  }

  async close() {
    this.activeRequests--
    if (this.activeRequests === 0) {
      this.closing = closeServer(this.app)
      await this.closing
    }
  }

  get(route: string) {
    return this.request('get', route)
  }

  post(route: string) {
    return this.request('post', route)
  }

  put(route: string) {
    return this.request('put', route)
  }

  patch(route: string) {
    return this.request('patch', route)
  }

  delete(route: string) {
    return this.request('delete', route)
  }

  options(route: string) {
    return this.request('options', route)
  }

  request(method: HttpMethod, route: string) {
    if (!this.app.listening)
      throw new Error('Supersession: await listen() before making a request, and close() after it')

    // eslint-disable-next-line
    var test = this.agent[method](route)

    // typescript is telling me I don't need to worry about agentOptions.before,
    // but leaving this commented out in case we need to revisit
    // if (this.agentOptions.before) {
    //   this.agentOptions.before.call(this, test)
    // }

    return test
  }
}

export const HttpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options'] as const
export type HttpMethod = (typeof HttpMethods)[number]

// What SpecSession and OpenapiSpecSession accept. Their constructors are public and
// took a plain supertest agent before sessions bound to 127.0.0.1, so they still
// take one and use it as they always did.
export type SessionAgent = Supersession | ReturnType<typeof request>

export default function supersession(
  // eslint-disable-next-line
  server: any,
  config: AgentOptions = {}
): Supersession {
  return new Supersession(server, config)
}
