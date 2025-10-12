import { OpenAPI } from '@rvoh/psychic'
import Balloon from '../../models/Balloon.js'
import User from '../../models/User.js'
import UsersBaseController from './BaseController.js'

const openApiTags = ['balloons']

export default class UsersBalloonsController extends UsersBaseController {
  @OpenAPI(Balloon, {
    status: 200,
    tags: openApiTags,
    description: 'Fetch multiple Balloons',
    many: true,
    serializerKey: 'summary',
  })
  public async index() {
    const user = await this.user()
    const balloons = await user.associationQuery('balloons').preloadFor('summary').all()
    this.ok(balloons)
  }

  @OpenAPI(Balloon, {
    status: 200,
    tags: openApiTags,
    description: 'Fetch a Balloon',
  })
  public async show() {
    const balloon = await this.balloon()
    this.ok(balloon)
  }

  @OpenAPI(Balloon, {
    status: 201,
    tags: openApiTags,
    description: 'Create a Balloon',
  })
  public async create() {
    const user = await this.user()
    let balloon = await user.createAssociation('balloons', this.paramsFor(Balloon))
    if (balloon.isPersisted) balloon = await balloon.loadFor('default').execute()
    this.created(balloon)
  }

  @OpenAPI(Balloon, {
    status: 204,
    tags: openApiTags,
    description: 'Update a Balloon',
  })
  public async update() {
    const balloon = await this.balloon()
    await balloon.update(this.paramsFor(Balloon))
    this.noContent()
  }

  @OpenAPI(Balloon, {
    status: 204,
    tags: openApiTags,
    description: 'Update a Balloon',
  })
  public async updatePut() {
    const balloon = await this.balloon()
    await balloon.update(this.paramsFor(Balloon))
    this.noContent()
  }

  @OpenAPI({
    status: 204,
    tags: openApiTags,
    description: 'Destroy a Balloon',
  })
  public async destroy() {
    const balloon = await this.balloon()
    await balloon.destroy()
    this.noContent()
  }

  private async user() {
    return await User.findOrFail(this.castParam('userId', 'string'))
  }

  private async balloon() {
    const user = await this.user()
    return await user
      .associationQuery('balloons')
      .preloadFor('default')
      .findOrFail(this.castParam('id', 'string'))
  }
}
