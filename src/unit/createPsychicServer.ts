// eslint-disable-next-line
const _server: any = undefined

// eslint-disable-next-line
export default async function createPsychicServer(PsychicServer: any) {
  // eslint-disable-next-line
  if (_server) return _server!

  // eslint-disable-next-line
  const server = new PsychicServer()
  // eslint-disable-next-line
  await server.boot()
  // eslint-disable-next-line
  return server
}
