// spec fixture: binds a tcp server on the given port immediately, then exits
// with the given code after the given lifespan (simulates a dev server dying mid-suite)
import { createServer } from 'net'

const port = Number(process.argv[2])
const lifespanMs = Number(process.argv[3] ?? 300)
const exitCode = Number(process.argv[4] ?? 0)

createServer().listen(port, '127.0.0.1')

setTimeout(() => {
  process.exit(exitCode)
}, lifespanMs)
