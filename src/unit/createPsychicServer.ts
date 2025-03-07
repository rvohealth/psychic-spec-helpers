const _server: any = undefined
export default async function createPsychicServer(PsychicServer: any) {
  if (_server) return _server!

  const server = new PsychicServer()
  await server.boot()
  return server
}
