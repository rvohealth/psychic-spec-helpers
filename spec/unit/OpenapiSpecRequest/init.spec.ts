import { OpenapiSpecRequest } from '../../../src/unit/OpenapiSpecRequest.js'
import { paths as openapiPaths } from '../../../test-app/src/types/openapi/openapi.js'

describe('OpenapiSpecRequest before init', () => {
  it('says to call init on it before making a request', async () => {
    const request = new OpenapiSpecRequest<openapiPaths>()
    await expect(request.get('/users', 200)).rejects.toThrow(
      'When making a request with an OpenapiSpecRequest, you must first call "await request.init(PsychicServer)" on it\n    from a beforeEach hook at the root of your specs.'
    )
  })
})
