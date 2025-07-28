import { PsychicServer } from '@rvoh/psychic'
import { OpenapiSpecRequest } from '../../../src/unit/OpenapiSpecRequest.js'
import User from '../../../test-app/src/app/models/User.js'
import { paths as openapiPaths } from '../../../test-app/src/types/openapi/openapi.js'

const request = new OpenapiSpecRequest<openapiPaths>()

describe('OpenapiSpecRequest#post', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('issues a post request to a controller endpoint, passing when the status matches', async () => {
    await request.post('/users', 201, {
      data: {
        email: 'how@yadoin',
      },
      headers: {
        hello: 'world',
      },
    })
    await User.findOrFailBy({ email: 'how@yadoin' })
  })

  context('with params', () => {
    it('correctly absorbs uri params from provided options', async () => {
      const id: string = '123'
      await request.post('/users/{userId}/posts', 201, {
        userId: id,
        headers: {
          hello: 'world',
        },
      })
    })
  })

  context('with requestBody', () => {
    context('type tests', () => {
      it.skip('allows strings for id types', async () => {
        await request.post('/users', 201, {
          data: {
            id: '123',
          },
        })
      })

      it.skip('allows numbers for id types', async () => {
        await request.post('/users', 201, {
          data: {
            id: 123,
          },
        })
      })

      it.skip('allows primary key values for id types', async () => {
        const user = User.new()
        await request.post('/users', 201, {
          data: {
            id: user.id,
          },
        })
      })
    })
  })
})
