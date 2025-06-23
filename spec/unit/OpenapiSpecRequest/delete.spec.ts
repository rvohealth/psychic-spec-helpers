import { PsychicServer } from '@rvoh/psychic'
import { OpenapiSpecRequest } from '../../../src/unit/OpenapiSpecRequest.js'
import User from '../../../test-app/src/app/models/User.js'
import { openapiPaths } from '../../../test-app/src/types/openapi.js'
import { IdType } from '@rvoh/dream'

const request = new OpenapiSpecRequest<openapiPaths>()

describe('OpenapiSpecRequest#delete', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('issues a delete request to a controller endpoint, passing when the status matches', async () => {
    const user = await User.create({ email: 'abc@def' })

    await request.delete('/users/{id}', 204, {
      id: user.id,
      headers: {
        hello: 'world',
      },
    })
    expect(await User.count()).toEqual(0)
  })

  context('without params', () => {
    it('issues a delete request to a controller endpoint, passing when the status matches', async () => {
      await request.delete('/user', 204, {
        headers: {
          hello: 'world',
        },
      })
      await request.delete('/user', 204)
    })
  })

  context('with nested resources', () => {
    it('correctly absorbs uri params from provided options', async () => {
      const userId: IdType = 123
      const id: IdType = 123
      await request.delete('/users/{userId}/posts/{id}', 204, {
        userId,
        id,
        headers: {
          hello: 'world',
        },
      })
    })
  })
})
