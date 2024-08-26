import '@rvohealth/dream-spec-helpers'

import _specRequest from './spec-request'

export { SpecRequest } from './spec-request'



const _server: any = undefined
export async function createPsychicServer(PsychicServer: any) {
  if (_server) return _server!

  const server = new PsychicServer()
  await server.boot()
  return server
}

export const specRequest = _specRequest
