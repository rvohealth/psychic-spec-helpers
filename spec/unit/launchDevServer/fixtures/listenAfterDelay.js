// spec fixture: binds a tcp server on the given port after an optional delay,
// then stays alive until killed
import { createServer } from 'net'

const port = Number(process.argv[2])
const delayMs = Number(process.argv[3] ?? 0)

setTimeout(() => {
  createServer().listen(port, '127.0.0.1')
}, delayMs)
