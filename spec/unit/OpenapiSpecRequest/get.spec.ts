import { PsychicServer } from '@rvoh/psychic'
import { OpenapiSpecRequest } from '../../../src/unit/OpenapiSpecRequest.js'
import User from '../../../test-app/src/app/models/User.js'
import { openapiPaths } from '../../../test-app/src/types/openapi.js'

const request = new OpenapiSpecRequest<openapiPaths>()

describe('OpenapiSpecRequest#get', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('issues a get request to a controller endpoint, passing when the status matches', async () => {
    const user = await User.create({ email: 'abc@def' })
    const res = await request.get('/users', 200, { headers: { hello: 'world' } })
    expect(res.body).toEqual([{ id: user.id, email: 'abc@def' }])
  })

  context('with params', () => {
    it('succeeds', async () => {
      const user = await User.create({ email: 'abc@def' })
      const res = await request.get('/users/{id}', 200, {
        id: user.id,
        headers: { hello: 'world' },
      })
      expect(res.body).toEqual({ id: user.id, email: 'abc@def' })
    })
  })

  context('query params', () => {
    it('issues a get request to a controller endpoint, passing when the status matches', async () => {
      await User.create({ email: 'other@user' })
      const user = await User.create({ email: 'abc@def' })
      const res = await request.get('/users', 200, {
        query: { search: 'abc' },
        headers: { hello: 'world' },
      })

      expect(res.body).toEqual([{ id: user.id, email: 'abc@def' }])
    })
  })
})
