import { Decorators, DreamColumn, DreamSerializers } from '@rvoh/dream'
import ApplicationModel from './ApplicationModel.js'
import Balloon from './Balloon.js'

const deco = new Decorators<typeof User>()

export default class User extends ApplicationModel {
  public get table() {
    return 'users' as const
  }

  public get serializers(): DreamSerializers<User> {
    return {
      default: 'UserSerializer',
      summary: 'UserSummarySerializer',
    }
  }

  public id: DreamColumn<User, 'id'>
  public email: DreamColumn<User, 'email'>
  public createdAt: DreamColumn<User, 'createdAt'>
  public updatedAt: DreamColumn<User, 'updatedAt'>

  @deco.HasMany('Balloon', { on: 'userId' })
  public balloons: Balloon
}
