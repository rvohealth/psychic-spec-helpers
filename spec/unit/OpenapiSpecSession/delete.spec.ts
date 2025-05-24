import { PsychicServer } from '@rvoh/psychic'
import { OpenapiSpecRequest } from '../../../src/unit/OpenapiSpecRequest.js'
import User from '../../../test-app/src/app/models/User.js'
import { openapiPaths } from '../../../test-app/src/types/openapi.js'

const request = new OpenapiSpecRequest<openapiPaths>()

describe('OpenapiSpecSession#delete', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('issues a delete request to a controller endpoint, passing when the status matches', async () => {
    const user = await User.create({ email: 'abc@def' })

    const session = await request.session('get', '/users', 200)
    await session.delete('/users/{id}', 204, {
      id: user.id,
    })
    expect(await User.count()).toEqual(0)
  })
})
