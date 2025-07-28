import { PsychicServer } from '@rvoh/psychic'
import { OpenapiSpecRequest } from '../../../src/unit/OpenapiSpecRequest.js'
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
})
