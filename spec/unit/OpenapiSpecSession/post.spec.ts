import { PsychicServer } from '@rvoh/psychic'
import { OpenapiSpecRequest } from '../../../src/unit/OpenapiSpecRequest.js'
import Balloon from '../../../test-app/src/app/models/Balloon.js'
import User from '../../../test-app/src/app/models/User.js'
import { paths as openapiPaths } from '../../../test-app/src/types/openapi/openapi.js'

const request = new OpenapiSpecRequest<openapiPaths>()

describe('OpenapiSpecSession#post', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('issues a get request to a controller endpoint, passing when the status matches', async () => {
    const session = await request.session('get', '/users', 200)
    await session.post('/users', 201, {
      data: {
        email: 'how@yadoin',
      },
    })
    await User.findOrFailBy({ email: 'how@yadoin' })
  })

  context('nested resource', () => {
    it('correctly interprets the nested resource id', async () => {
      const user = await User.create({ email: 'abc@def' })
      const session = await request.session('get', '/users', 200)
      await session.post('/users/{userId}/balloons', 201, {
        userId: user.id,
        data: {
          color: 'blue',
        },
      })

      const balloon = await Balloon.preload('user').first()
      expect(balloon?.color).toEqual('blue')
      expect(balloon?.user).toMatchDreamModel(user)
    })
  })
})
