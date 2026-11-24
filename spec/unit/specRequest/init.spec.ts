import { SpecRequest } from '../../../src/index.js'

describe('specRequest before init', () => {
  it('says to call init before making a request', async () => {
    await expect(new SpecRequest().get('/spec-request/get-test', 200)).rejects.toThrow(
      'When making a request with specRequest, you must first call "await specRequest.init(PsychicServer)"\n    from a beforeEach hook at the root of your specs.'
    )
  })
})
