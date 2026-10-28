import { PsychicServer } from '@rvoh/psychic'
import { specRequest as request } from '../../../src/index.js'

// `httpMethod` accepts every HttpMethod, including 'options'. Session objects
// used to keep their agent options in a field named `options`, which shadowed the
// OPTIONS method, so starting a session with an OPTIONS request threw
// "is not a function" (and, before sessions became async, hung until timeout).
describe('starting a session with each HTTP method', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('specRequest.session sends an OPTIONS request', async () => {
    const session = await request.session('spec-session/start-session', 200, {
      httpMethod: 'options',
    })
    await session.get('spec-session/auth-test', 401)
  })
})
