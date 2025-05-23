import { OpenAPI } from '@rvoh/psychic'
import ApplicationController from './ApplicationController.js'
import User from '../models/User.js'
import { ops } from '@rvoh/dream'

export default class UsersController extends ApplicationController {
  @OpenAPI(User, {
    status: 201,
  })
  public async create() {
    await User.create(this.paramsFor(User))
    this.created()
  }

  @OpenAPI(User, {
    many: true,
    query: {
      search: {
        required: false,
      },
    },
  })
  public async index() {
    this.ok(
      await User.where({
        email: ops.ilike(`%${this.castParam('search', 'string', { allowNull: true }) || ''}%`),
      }).all()
    )
  }

  @OpenAPI(User)
  public async show() {
    this.ok(await User.find(this.castParam('id', 'string')))
  }

  @OpenAPI(User, { status: 204 })
  public async update() {
    const user = await User.findOrFail(this.castParam('id', 'string'))
    await user.update(this.paramsFor(User))
    this.noContent()
  }

  @OpenAPI(User, { status: 204 })
  public async updatePut() {
    const user = await User.findOrFail(this.castParam('id', 'string'))
    await user.update(this.paramsFor(User))
    this.noContent()
  }

  @OpenAPI(User, { status: 204 })
  public async destroy() {
    const user = await User.findOrFail(this.castParam('id', 'string'))
    await user.destroy()
    this.noContent()
  }
}
