import { PsychicServer } from '@rvoh/psychic'
import { OpenapiSpecRequest } from '../../../src/unit/OpenapiSpecRequest.js'
import Balloon from '../../../test-app/src/app/models/Balloon.js'
import User from '../../../test-app/src/app/models/User.js'
import { paths as openapiPaths } from '../../../test-app/src/types/openapi/openapi.js'

const request = new OpenapiSpecRequest<openapiPaths>()

describe('OpenapiSpecSession#get', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('issues a get request to a controller endpoint, passing when the status matches', async () => {
    const user = await User.create({ email: 'abc@def' })
    const session = await request.session('get', '/users', 200)
    const res = await session.get('/users', 200)
    expect(res.body).toEqual([{ id: user.id, email: 'abc@def' }])
  })

  context('query params', () => {
    it('issues a get request to a controller endpoint, passing when the status matches', async () => {
      await User.create({ email: 'other@user' })
      const user = await User.create({ email: 'abc@def' })
      const session = await request.session('get', '/users', 200)
      const res = await session.get('/users', 200, { query: { search: 'abc' } })

      expect(res.body).toEqual([{ id: user.id, email: 'abc@def' }])
    })
  })

  context('nested resource', () => {
    it('correctly interprets the nested resource id', async () => {
      const user = await User.create({ email: 'abc@def' })
      const balloon = await Balloon.create({ user, color: 'red' })
      const session = await request.session('get', '/users', 200)
      const { body } = await session.get('/users/{userId}/balloons/{id}', 200, {
        userId: user.id,
        id: balloon.id,
      })
      expect(body.id).toEqual(balloon.id)
      expect(body.color).toEqual('red')
    })
  })
})
