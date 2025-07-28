import { PsychicServer } from '@rvoh/psychic'
import { OpenapiSpecRequest } from '../../../src/unit/OpenapiSpecRequest.js'
import { paths as openapiPaths } from '../../../test-app/src/types/openapi/openapi.js'

const request = new OpenapiSpecRequest<openapiPaths>()

describe('OpenapiSpecRequest#defaultHeaders', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('includes headers in all subsequent requests', async () => {
    request.setDefaultHeaders({ goodbye: 'world' })

    const res1 = await request.get('/headers-test', 200, { headers: { hello: 'world' } })
    expect(res1.body).toEqual(
      expect.objectContaining({
        hello: 'world',
        goodbye: 'world',
      })
    )

    const res2 = await request.get('/headers-test', 200, { headers: { hello: 'world' } })
    expect(res2.body).toEqual(
      expect.objectContaining({
        hello: 'world',
        goodbye: 'world',
      })
    )
  })

  context('when overriding default headers', () => {
    it('allows overrides', async () => {
      request.setDefaultHeaders({ hello: 'birld', goodbye: 'world' })

      const res = await request.get('/headers-test', 200, { headers: { hello: 'world' } })
      expect(res.body).toEqual(
        expect.objectContaining({
          hello: 'world',
          goodbye: 'world',
        })
      )
    })
  })
})
