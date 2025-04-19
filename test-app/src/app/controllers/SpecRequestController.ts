import ApplicationController from './ApplicationController.js'

export default class SpecRequestController extends ApplicationController {
  public testGet() {
    if (this.params.throw400) this.badRequest()

    this.ok({
      query: this.req.query,
      headers: this.req.headers,
    })
  }

  public testPost() {
    if (this.params.throw400) this.badRequest()

    this.ok({
      body: this.req.body,
      headers: this.req.headers,
    })
  }

  public testPut() {
    this.testPost()
  }

  public testPatch() {
    this.testPost()
  }

  public testDelete() {
    this.testPost()
  }
}
