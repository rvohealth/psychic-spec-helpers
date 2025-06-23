import { OpenAPI } from '@rvoh/psychic'
import ApplicationController from '../ApplicationController.js'

export default class PostsController extends ApplicationController {
  @OpenAPI({ status: 201 })
  public create() {
    this.testUserIdParam()
    this.created()
  }

  @OpenAPI({ status: 204 })
  public update() {
    this.testUserIdParam()
    this.testIdParam()
    this.noContent()
  }

  @OpenAPI({ status: 204 })
  public destroy() {
    this.testUserIdParam()
    this.testIdParam()
    this.noContent()
  }

  @OpenAPI({ status: 200 })
  public show() {
    this.testUserIdParam()
    this.testIdParam()
    this.ok()
  }

  @OpenAPI({ status: 200 })
  public index() {
    this.testUserIdParam()
    this.ok()
  }

  private testUserIdParam() {
    // this line will throw an actual error if the uri params
    // are not correctly parsed before sending the request.
    // this resulted in a real bug in our spec requests.
    this.castParam('userId', 'integer')
  }

  private testIdParam() {
    // this line will throw an actual error if the uri params
    // are not correctly parsed before sending the request.
    // this resulted in a real bug in our spec requests.
    this.castParam('id', 'integer')
  }
}
