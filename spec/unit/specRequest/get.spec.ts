import { PsychicServer } from '@rvoh/psychic'
import { specRequest as request } from '../../../src/index.js'

describe('specRequest#get', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('issues a get request to a controller endpoint, passing when the status matches', async () => {
    const res = await request.get(`/spec-request/get-test`, 200, {
      query: {
        a: 'a',
        b: 'b',
      },
      headers: {
        headerA: 'A',
        headerB: 'B',
      },
    })
    expect(res.body).toEqual({
      query: { a: 'a', b: 'b' },
      headers: expect.objectContaining({
        headera: 'A',
        headerb: 'B',
      }) as object,
    })
  })

  it('fails when the status does not match', async () => {
    await expect(async () => {
      await request.get(`/spec-request/get-test`, 201)
    }).rejects.toThrow()
  })

  context('with an error status', () => {
    it('passes when the error status is expected', async () => {
      await request.get(`/spec-request/get-test`, 400, {
        query: { throw400: true },
      })
    })

    it('fails when the error status is not expected', async () => {
      await expect(async () => {
        await request.get(`/spec-request/get-test`, 200, {
          query: { throw400: true },
        })
      }).rejects.toThrow()
    })
  })
})
