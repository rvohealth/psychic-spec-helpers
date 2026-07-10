import { connect } from 'net'
import { launchDevServer, stopDevServer, stopDevServers } from '../../../src/index.js'
import sleep from '../../../src/shared/sleep.js'

const FIXTURES = 'spec/unit/launchDevServer/fixtures'

async function isPortListening(port: number): Promise<boolean> {
  return await new Promise(resolve => {
    const socket = connect({ port, host: '127.0.0.1' })
      .once('connect', () => {
        socket.destroy()
        resolve(true)
      })
      .once('error', () => {
        resolve(false)
      })
  })
}

async function waitFor(predicate: () => boolean, timeoutMs: number = 3000) {
  const startTime = Date.now()
  while (!predicate()) {
    if (Date.now() > startTime + timeoutMs) throw new Error('waitFor timed out')
    await sleep(50)
  }
}

describe('launchDevServer', () => {
  afterEach(() => {
    try {
      stopDevServers()
    } catch {
      // specs assert on server lifecycle themselves; cleanup is best-effort
    }
  })

  it('resolves once the dev server is actually listening on the port, even when the server takes a moment to bind', async () => {
    await launchDevServer('delayed-bind', {
      port: 33431,
      cmd: `node ${FIXTURES}/listenAfterDelay.js 33431 500`,
      timeout: 10000,
    })

    expect(await isPortListening(33431)).toBe(true)
  })

  it('rejects with a comprehensible error when the command cannot be spawned', async () => {
    await expect(
      launchDevServer('bad-command', {
        port: 33432,
        cmd: 'nonexistent-command-cba0e2b19c',
        timeout: 10000,
      })
    ).rejects.toThrow(/failed to start/)
  })

  it('rejects when the process exits before ever listening on the port', async () => {
    await expect(
      launchDevServer('early-exit', {
        port: 33433,
        cmd: `node ${FIXTURES}/exitWithCode.js 7`,
        timeout: 10000,
      })
    ).rejects.toThrow(/exited with code 7 before listening on port 33433/)
  })

  it('rejects when the process never listens on the port within the timeout', async () => {
    await expect(
      launchDevServer('never-listens', {
        port: 33434,
        cmd: `node ${FIXTURES}/neverListen.js`,
        timeout: 500,
      })
    ).rejects.toThrow(/did not listen on port 33434 within 500ms/)
  })

  context('when the dev server dies mid-suite', () => {
    it('logs the death without DEBUG=1 and evicts the process so it is not treated as still running', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await launchDevServer('mid-suite-death', {
        port: 33435,
        cmd: `node ${FIXTURES}/listenThenExit.js 33435 300 9`,
        timeout: 10000,
      })

      await waitFor(() =>
        consoleErrorSpy.mock.calls.some(args =>
          /exited unexpectedly with code 9/.test(String(args[0]))
        )
      )

      expect(() => stopDevServer('mid-suite-death')).toThrow(/Cannot find a dev server/)
    })
  })

  it('launches and stops a dev server that binds immediately', async () => {
    await launchDevServer('happy-path', {
      port: 33436,
      cmd: `node ${FIXTURES}/listenAfterDelay.js 33436 0`,
      timeout: 10000,
    })
    expect(await isPortListening(33436)).toBe(true)

    stopDevServer('happy-path')
    expect(() => stopDevServer('happy-path')).toThrow(/Cannot find a dev server/)
  })
})
