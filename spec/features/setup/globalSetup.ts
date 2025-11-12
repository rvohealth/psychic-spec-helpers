import '../../../test-app/src/conf/loadEnv.js'

import { PsychicDevtools } from '@rvoh/psychic'
import { closeBrowser } from '../../../src/index.js'

export async function setup() {
  await PsychicDevtools.launchDevServer('client', { port: 3000, cmd: 'yarn client:fspec' })
}

export async function teardown() {
  await closeBrowser()
  PsychicDevtools.stopDevServers()
}
