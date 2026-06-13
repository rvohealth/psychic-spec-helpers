// The booted spec server is cached for the lifetime of the worker process so it
// is created and booted exactly once, then reused by every spec — instead of
// re-booting a brand-new PsychicServer for each spec, which re-runs application
// initialization and churns database/websocket connections (a significant
// source of slow suites and flaky, connection-exhaustion-driven failures).
//
// The cache lives on `globalThis` rather than in a module-scoped variable
// because isolating test runners (e.g. Vitest with the default `isolate: true`)
// reset the module registry between spec files. A module-scoped cache would be
// discarded at every file boundary, forcing a fresh boot per file; `globalThis`
// persists for the whole worker process, so the server boots once per worker.
const CACHED_SPEC_SERVER_KEY = Symbol.for('@rvoh/psychic-spec-helpers:cachedSpecServer')

// eslint-disable-next-line
export default async function createPsychicServer(PsychicServer: any) {
  // eslint-disable-next-line
  const store = globalThis as Record<symbol, any>

  // eslint-disable-next-line
  if (store[CACHED_SPEC_SERVER_KEY]) return store[CACHED_SPEC_SERVER_KEY]

  // eslint-disable-next-line
  const server = new PsychicServer()
  // eslint-disable-next-line
  await server.boot()

  // eslint-disable-next-line
  store[CACHED_SPEC_SERVER_KEY] = server
  // eslint-disable-next-line
  return server
}
