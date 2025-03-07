import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { createServer } from 'net'
import sleep from '../../shared/sleep.js'

let serverProcess: ChildProcessWithoutNullStreams | undefined = undefined

export default async function launchViteServer({
  port = 3000,
  cmd = 'yarn client',
  timeout = 5000,
}: { port?: number; cmd?: string; timeout?: number } = {}) {
  if (serverProcess) return

  if (process.env.DEBUG === '1') console.log('Starting server...')
  const [_cmd, ...args] = cmd.split(' ')

  serverProcess = spawn(_cmd, args, {
    detached: true,
    env: {
      ...process.env,
      BROWSER: 'none',
      VITE_PSYCHIC_ENV: 'test',
    },
  })

  await waitForPort(port, timeout)

  serverProcess.stdout.on('data', data => {
    if (process.env.DEBUG === '1') console.log(`Server output: ${data}`)
  })

  serverProcess.on('error', err => {
    throw err
  })

  serverProcess.stdout.on('data', data => {
    if (process.env.DEBUG === '1') console.log(`Server output: ${data}`)
  })

  serverProcess.stderr.on('data', data => {
    if (process.env.DEBUG === '1') console.error(`Server error: ${data}`)
  })

  serverProcess.on('error', err => {
    console.error(`Server process error: ${err as unknown as string}`)
  })

  serverProcess.on('close', code => {
    if (process.env.DEBUG === '1') console.log(`Server process exited with code ${code}`)
  })
}

export function stopViteServer() {
  if (serverProcess?.pid) {
    if (process.env.DEBUG === '1') console.log('Stopping server...')
    // serverProcess.kill('SIGINT')
    process.kill(-serverProcess.pid, 'SIGKILL')
    serverProcess = undefined

    if (process.env.DEBUG === '1') console.log('server stopped')
  }
}

async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = createServer()
      .once('error', err => {
        if ((err as any).code === 'EADDRINUSE') {
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

async function waitForPort(port: number, timeout: number = 5000) {
  if (await isPortAvailable(port)) {
    return true
  }

  const startTime = Date.now()

  async function recursiveWaitForPort() {
    if (await isPortAvailable(port)) {
      return true
    }

    if (Date.now() > startTime + timeout) {
      stopViteServer()
      throw new Error('waited too long for port: ' + port)
    }

    await sleep(50)
    return await recursiveWaitForPort()
  }

  return await recursiveWaitForPort()
}
