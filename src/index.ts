import '@rvohealth/dream-spec-helpers'

import _specRequest from './spec-request'

export { SpecRequest } from './spec-request'
export { SpecSession } from './spec-session'

const _server: any = undefined
export async function createPsychicServer(PsychicServer: any) {
  if (_server) return _server!

  const server = new PsychicServer()
  await server.boot()
  return server
}

let _fspecServer: any = undefined
export async function startFspecServer(PsychicServer: any, { port }: { port?: number } = {}) {
  if (_fspecServer) return _fspecServer

  const server = new PsychicServer()
  await server.start(port || parseInt(process.env.DEV_SERVER_PORT || '7778'))

  _fspecServer = server

  return server
}

export async function stopFspecServer() {
  await _fspecServer?.stop({ bypassClosingDbConnections: true })
  _fspecServer = undefined
}

export const specRequest = _specRequest
