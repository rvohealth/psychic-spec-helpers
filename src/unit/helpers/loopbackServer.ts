import http from 'node:http'

// supertest binds a server it is handed with a wildcard `listen(0)` and then
// connects to 127.0.0.1. On macOS that wildcard bind can take a port another
// process holds on 127.0.0.1 only, so the request reaches that process instead
// of the app under test. Binding to 127.0.0.1 ourselves, before supertest sees
// the server, rules that out: supertest uses a listening server's port as is.

export async function listenOnLoopback(server: http.Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => reject(error)
    server.once('error', onError)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', onError)
      resolve()
    })
  })
}

export async function closeServer(server: http.Server): Promise<void> {
  if (!server.listening) return

  await new Promise<void>((resolve, reject) => {
    server.close(error => (error ? reject(error) : resolve()))
    // the request has finished; don't wait on keep-alive sockets to time out
    server.closeAllConnections()
  })
}
