import { PsychicServer } from '@rvoh/psychic'
import { OpenapiSpecRequest } from '../../../src/unit/OpenapiSpecRequest.js'
import User from '../../../test-app/src/app/models/User.js'
import { openapiPaths } from '../../../test-app/src/types/openapi.js'

const request = new OpenapiSpecRequest<openapiPaths>()

describe('OpenapiSpecRequest#put', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('issues a patch request to a controller endpoint, passing when the status matches', async () => {
    const user = await User.create({ email: 'abc@def' })
    await request.put('/users/{id}/update-put', 204, {
      id: user.id,
      data: {
        email: 'how@yadoin',
      },
      headers: {
        hello: 'world',
      },
    })
    await User.findOrFailBy({ email: 'how@yadoin' })
  })

  context('without params', () => {
    it('issues a put request to a controller endpoint, passing when the status matches', async () => {
      await request.put('/user/update-put', 204, {
        headers: {
          hello: 'world',
        },
      })
      await request.put('/user/update-put', 204)
    })
  })
})
