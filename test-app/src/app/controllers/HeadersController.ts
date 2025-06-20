import { OpenAPI } from '@rvoh/psychic'
import ApplicationController from './ApplicationController.js'

export default class HeadersController extends ApplicationController {
  @OpenAPI({
    status: 200,
  })
  public testHeaders() {
    this.ok(this.req.headers)
  }
}
