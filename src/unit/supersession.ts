import { CookieAccessInfo as CookieAccess } from 'cookiejar'
import http from 'http'
import request from 'supertest'
import URL, { UrlWithStringQuery } from 'url'

// NOTE: this is not original code.
// it was adapted from a non-typescript library with an uncertain future:
//
// https://github.com/rjz/supertest-session/blob/master/index.js

type AgentOptions = Parameters<typeof request.agent>[1]

class Supersession {
  private app: http.Server
  private agent: ReturnType<typeof request.agent>
  private url: UrlWithStringQuery
  private cookieAccess: CookieAccess

  constructor(
    server: any,
    private options: AgentOptions = {}
  ) {
    if (!server.expressApp) {
      throw new Error('Supersession requires an `app`')
    }

    this.agent = request.agent(server.expressApp, options)

    const app = http.createServer(server.expressApp)
    const url = (request as any).Test.prototype.serverAddress(app, '/')

    this.app = app
    this.url = URL.parse(url)

    this.reset()

    // typescript is telling me I don't need to worry about options.helpers,
    // but leaving this commented out in case we need to revisit
    // if (this.options.helpers instanceof Object) {
    //   assign(this, this.options.helpers)
    // }
  }

  get cookies() {
    return (this.agent as any).jar.getCookies(this.cookieAccess)
  }

  public reset() {
    // Unset supertest-session options before forwarding options to superagent.
    var agentOptions = {
      ...this.options,
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
    this.cookieAccess = (CookieAccess as any)(domain, path, secure, script)
  }

  destroy() {
    if ((this.options as any).destroy) (this.options as any).destroy.call(this)
    this.reset()
  }

  request(method: HttpMethod, route: string) {
    var test = this.agent[method](route)

    // typescript is telling me I don't need to worry about options.before,
    // but leaving this commented out in case we need to revisit
    // if (this.options.before) {
    //   this.options.before.call(this, test)
    // }

    return test
  }
}

export const HttpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options'] as const
export type HttpMethod = (typeof HttpMethods)[number]

HttpMethods.forEach(function (m) {
  ;(Supersession as any).prototype[m as any] = function () {
    var args = [].slice.call(arguments)
    return this.request.apply(this, [m].concat(args))
  }
})

export default function supersession(
  server: any,
  config: AgentOptions = {}
): ReturnType<typeof request> {
  return new Supersession(server, config) as unknown as ReturnType<typeof request>
}
