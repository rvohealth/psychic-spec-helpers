import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { createServer } from 'net'
import sleep from '../../shared/sleep.js'

const devServerProcesses: Record<string, ChildProcessWithoutNullStreams | undefined> = {}

export default async function launchDevServer(
  key: string,
  {
    port = 3000,
    cmd = 'yarn client',
    timeout = 5000,
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

  await waitForPort(key, port, timeout)

  proc.on('error', err => {
    throw err
  })

  proc.stdout.on('data', data => {
    if (process.env.DEBUG === '1') console.log(`Server output: ${data}`)
  })

  proc.stderr.on('data', data => {
    if (process.env.DEBUG === '1') console.error(`Server error: ${data}`)
  })

  proc.on('error', err => {
    console.error(`Server process error: ${err as unknown as string}`)
  })

  proc.on('close', code => {
    if (process.env.DEBUG === '1') console.log(`Server process exited with code ${code}`)
  })
}

export function stopDevServer(key: string) {
  const proc = devServerProcesses[key]
  if (!proc) {
    throw new Error(`Cannot find a dev server by the key: ${key}`)
  }

  if (proc?.pid) {
    if (process.env.DEBUG === '1') console.log('Stopping server...')
    // serverProcess.kill('SIGINT')
    process.kill(-proc.pid, 'SIGKILL')
    delete devServerProcesses[key]

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

async function waitForPort(key: string, port: number, timeout: number = 5000) {
  if (await isPortAvailable(port)) {
    return true
  }

  const startTime = Date.now()

  async function recursiveWaitForPort() {
    if (await isPortAvailable(port)) {
      return true
    }

    if (Date.now() > startTime + timeout) {
      stopDevServer(key)
      throw new Error('waited too long for port: ' + port)
    }

    await sleep(50)
    return await recursiveWaitForPort()
  }

  return await recursiveWaitForPort()
}
