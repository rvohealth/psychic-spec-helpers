import { OpenAPI } from '@rvoh/psychic'
import User from '../models/User.js'
import ApplicationController from './ApplicationController.js'

export default class UserController extends ApplicationController {
  @OpenAPI(User, {
    status: 201,
  })
  public create() {
    this.created()
  }

  @OpenAPI(User)
  public show() {
    this.ok()
  }

  @OpenAPI(User, { status: 204 })
  public update() {
    this.noContent()
  }

  @OpenAPI(User, { status: 204 })
  public updatePut() {
    this.noContent()
  }

  @OpenAPI(User, { status: 204 })
  public destroy() {
    this.noContent()
  }
}
