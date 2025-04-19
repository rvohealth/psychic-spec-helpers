import { PsychicRouter } from '@rvoh/psychic'
import SpecRequestController from '../app/controllers/SpecRequestController.js'

export default (r: PsychicRouter) => {
  r.get('/spec-request/get-test', SpecRequestController, 'testGet')
  r.post('/spec-request/post-test', SpecRequestController, 'testPost')
  r.patch('/spec-request/patch-test', SpecRequestController, 'testPatch')
  r.put('/spec-request/put-test', SpecRequestController, 'testPut')
  r.delete('/spec-request/delete-test', SpecRequestController, 'testDelete')

  // session
  r.get('spec-session/auth-test', SpecRequestController, 'authTest')
  r.post('spec-session/start-session', SpecRequestController, 'sessionStart')
}
