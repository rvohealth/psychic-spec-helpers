import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { createServer } from 'net'
import sleep from '../../shared/sleep.js'

const devServerProcesses: Record<string, ChildProcessWithoutNullStreams | undefined> = {}

export default async function launchDevServer(
  key: string,
  {
    port = 3000,
    cmd = 'pnpm client',
    timeout = 30000,
  }: { port?: number; cmd?: string; timeout?: number } = {}
) {
  if (devServerProcesses[key]) return

  if (process.env.DEBUG === '1') console.log('Starting server...')
  const [_cmd, ...args] = cmd.split(' ')

  const proc = spawn(_cmd, args, {
    detached: true,
    env: {
      ...process.env,
      BROWSER: 'none',
      VITE_PSYCHIC_ENV: 'test',
    },
  })

  devServerProcesses[key] = proc

  let spawnError: Error | undefined
  let exited = false
  let exitCode: number | null = null

  // attached before any await so that an immediate spawn failure (e.g. ENOENT)
  // cannot emit 'error' with no listener and crash the process
  proc.on('error', err => {
    spawnError = err
    console.error(`Dev server "${key}" (\`${cmd}\`) process error: ${err.message}`)
  })

  proc.stdout.on('data', data => {
    if (process.env.DEBUG === '1') console.log(`Server output: ${data}`)
  })

  proc.stderr.on('data', data => {
    if (process.env.DEBUG === '1') console.error(`Server error: ${data}`)
  })

  proc.on('close', code => {
    exited = true
    exitCode = code

    if (devServerProcesses[key] === proc) {
      // the process died on its own (it was not stopped via stopDevServer); evict it
      // so it is not treated as still running, and log unconditionally so specs that
      // subsequently fail on a dead dev server are comprehensible
      delete devServerProcesses[key]
      if (!spawnError)
        console.error(`Dev server "${key}" (\`${cmd}\`) exited unexpectedly with code ${code}`)
    } else if (process.env.DEBUG === '1') {
      console.log(`Server process exited with code ${code}`)
    }
  })

  try {
    await waitForPort(key, cmd, port, timeout, () => {
      if (spawnError)
        return new Error(
          `Dev server "${key}" (\`${cmd}\`) failed to start: ${spawnError.message}`,
          {
            cause: spawnError,
          }
        )

      if (exited)
        return new Error(
          `Dev server "${key}" (\`${cmd}\`) exited with code ${exitCode} before listening on port ${port}`
        )

      return undefined
    })
  } catch (err) {
    if (devServerProcesses[key] === proc) delete devServerProcesses[key]
    throw err
  }
}

export function stopDevServer(key: string) {
  const proc = devServerProcesses[key]
  if (!proc) {
    throw new Error(`Cannot find a dev server by the key: ${key}`)
  }

  if (proc?.pid) {
    if (process.env.DEBUG === '1') console.log('Stopping server...')
    // delete before killing so the 'close' listener can distinguish an intentional
    // stop from the dev server dying on its own
    delete devServerProcesses[key]
    // serverProcess.kill('SIGINT')
    process.kill(-proc.pid, 'SIGKILL')

    if (process.env.DEBUG === '1') console.log('server stopped')
  }
}

export function stopDevServers() {
  Object.keys(devServerProcesses).forEach(key => {
    stopDevServer(key)
  })
}

async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = createServer()
      .once('error', err => {
        if ((err as unknown as Record<string, string>).code === 'EADDRINUSE') {
          resolve(false)
        } else {
          resolve(true)
        }
      })
      .once('listening', () => {
        server.close()
        resolve(true)
      })
      .listen(port, '127.0.0.1')
  })
}

async function waitForPort(
  key: string,
  cmd: string,
  port: number,
  timeout: number,
  abortError: () => Error | undefined
) {
  const startTime = Date.now()

  // the port being available means nothing is listening on it yet,
  // so keep waiting until the dev server has actually bound it
  while (await isPortAvailable(port)) {
    const error = abortError()
    if (error) throw error

    if (Date.now() > startTime + timeout) {
      if (devServerProcesses[key]) stopDevServer(key)
      throw new Error(
        `Dev server "${key}" (\`${cmd}\`) did not listen on port ${port} within ${timeout}ms`
      )
    }

    await sleep(50)
  }
}
