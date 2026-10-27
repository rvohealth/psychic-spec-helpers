import '../../../test-app/src/conf/loadEnv.js'

import { PsychicDevtools } from '@rvoh/psychic/system'
import { CLIENT_PORT } from '../helpers/clientUrl.js'

export async function setup() {
  await PsychicDevtools.launchDevServer('client', { port: CLIENT_PORT, cmd: 'pnpm client:fspec' })
}

export function teardown() {
  PsychicDevtools.stopDevServers()
}
