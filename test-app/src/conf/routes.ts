import { PsychicRouter } from '@rvoh/psychic'
import SpecRequestController from '../app/controllers/SpecRequestController.js'
import UserController from '../app/controllers/UserController.js'
import UsersController from '../app/controllers/UsersController.js'
import HeadersController from '../app/controllers/HeadersController.js'

export default (r: PsychicRouter) => {
  r.get('/spec-request/get-test', SpecRequestController, 'testGet')
  r.post('/spec-request/post-test', SpecRequestController, 'testPost')
  r.patch('/spec-request/patch-test', SpecRequestController, 'testPatch')
  r.put('/spec-request/put-test', SpecRequestController, 'testPut')
  r.delete('/spec-request/delete-test', SpecRequestController, 'testDelete')

  // session
  r.get('spec-session/auth-test', SpecRequestController, 'authTest')
  r.post('spec-session/start-session', SpecRequestController, 'sessionStart')

  // openapi
  r.resources('users', r => {
    r.put('update-put', UsersController, 'updatePut')
  })
  r.resource('user', r => {
    r.put('update-put', UserController, 'updatePut')
  })

  // misc
  r.get('/headers-test', HeadersController, 'testHeaders')
}
