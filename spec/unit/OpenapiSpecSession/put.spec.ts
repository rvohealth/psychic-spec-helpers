import { PsychicServer } from '@rvoh/psychic'
import { OpenapiSpecRequest } from '../../../src/unit/OpenapiSpecRequest.js'
import Balloon from '../../../test-app/src/app/models/Balloon.js'
import User from '../../../test-app/src/app/models/User.js'
import { paths as openapiPaths } from '../../../test-app/src/types/openapi/openapi.js'

const request = new OpenapiSpecRequest<openapiPaths>()

describe('OpenapiSpecSession#put', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('issues a put request to a controller endpoint, passing when the status matches', async () => {
    const user = await User.create({ email: 'abc@def' })
    const session = await request.session('get', '/users', 200)
    await session.put('/users/{id}/update-put', 204, {
      id: user.id,
      data: {
        email: 'how@yadoin',
      },
    })
    await User.findOrFailBy({ email: 'how@yadoin' })
  })

  context('nested resource', () => {
    it('correctly interprets the nested resource id', async () => {
      const user = await User.create({ email: 'abc@def' })
      const balloon = await Balloon.create({ user, color: 'red' })
      const session = await request.session('get', '/users', 200)
      await session.put('/users/{userId}/balloons/{id}/update-put', 204, {
        userId: user.id,
        id: balloon.id,
        data: {
          color: 'blue',
        },
      })
      await balloon.reload()
      expect(balloon.color).toEqual('blue')
    })
  })
})
