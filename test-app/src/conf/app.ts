import { PsychicApp } from '@rvoh/psychic'
import importDefault from '../app/helpers/importDefault.js'
import srcPath from '../app/helpers/srcPath.js'
import inflections from './inflections.js'
import routesCb from './routes.js'

export default async (psy: PsychicApp) => {
  await psy.load('controllers', srcPath('app', 'controllers'), path => importDefault(path))
  await psy.load('services', srcPath('app', 'services'), path => importDefault(path))

  psy.set('appName', 'testapp')
  psy.set('packageManager', 'yarn')
  psy.set('apiOnly', false)
  psy.set('apiRoot', srcPath('..', '..'))
  psy.set('clientRoot', srcPath('..', 'client'))
  psy.set('inflections', inflections)
  psy.set('routes', routesCb)

  psy.set('encryption', {
    cookies: {
      current: {
        algorithm: 'aes-256-gcm',
        key: process.env.APP_ENCRYPTION_KEY!,
      },
    },
  })

  psy.set('paths', {
    apiRoutes: 'test-app/src/conf/routes.ts',
    controllers: 'test-app/src/app/controllers',
    controllerSpecs: 'test-app/spec/unit/controllers',
  })

  psy.set('openapi', {
    syncTypes: true,
  })

  psy.set('openapi', 'validation', {
    outputFilepath: 'validation.openapi.json',
    syncTypes: true,
  })

  psy.set('openapi', 'admin', {
    outputFilepath: 'admin.openapi.json',
    syncTypes: true,
  })

  // set options to pass to coors when middleware is booted
  psy.set('cors', {
    credentials: true,
    origin: [process.env.CLIENT_HOST || 'http://localhost:3000'],
  })

  // set options for cookie usage
  psy.set('cookie', {
    maxAge: {
      days: 4,
    },
  })
}
