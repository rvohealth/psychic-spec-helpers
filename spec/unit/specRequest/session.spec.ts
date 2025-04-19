import { PsychicServer } from '@rvoh/psychic'
import { specRequest as request } from '../../../src/index.js'

describe('specRequest#session', () => {
  beforeEach(async () => {
    await request.init(PsychicServer)
  })

  it('issues a put request to a controller endpoint, passing when the status matches, and failing when it does not', async () => {
    // ensure that our auth-test endpoint will not pass without a valid cookie
    await request.get('spec-session/auth-test', 401)

    // send in a good password, which will cause a cookie to be attached to our
    // session variable, which we can use to make subsequent requests with cookies
    // attached
    const session = await request.session(`spec-session/start-session`, 204, {
      data: {
        password: 'goodpass',
      },
    })
    await session.get('spec-session/auth-test', 204)

    // try making a new session, but this time, with a password that will not
    // match, so that the cookie is not set, which will prevent auth-test from
    // returning a 204
    const badSession = await request.session(`spec-session/start-session`, 401, {
      data: {
        password: 'badpass',
      },
    })
    await badSession.get('spec-session/auth-test', 401)
  })
})
