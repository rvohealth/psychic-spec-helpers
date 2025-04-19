import { PsychicServer } from '@rvoh/psychic'
import { specRequest as request } from '../../../src/index.js'

describe('specRequest#delete', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('issues a delete request to a controller endpoint, passing when the status matches', async () => {
    const res = await request.delete(`/spec-request/delete-test`, 200, {
      data: {
        a: 'a',
        b: 'b',
      },
      headers: {
        headerA: 'A',
        headerB: 'B',
      },
    })
    expect(res.body).toEqual({
      body: { a: 'a', b: 'b' },
      headers: expect.objectContaining({
        headera: 'A',
        headerb: 'B',
      }),
    })
  })

  it('fails when the status does not match', async () => {
    await expect(async () => {
      await request.delete(`/spec-request/delete-test`, 201)
    }).rejects.toThrow()
  })

  context('with an error status', () => {
    it('passes when the error status is expected', async () => {
      await request.delete(`/spec-request/delete-test`, 400, {
        data: { throw400: true },
      })
    })

    it('fails when the error status is not expected', async () => {
      await expect(async () => {
        await request.delete(`/spec-request/delete-test`, 200, {
          data: { throw400: true },
        })
      }).rejects.toThrow()
    })
  })
})
