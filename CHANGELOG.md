## 3.3.0

- `launchDevServer` fixes:
  - `waitForPort`'s polarity was inverted — it resolved as soon as the port was _free_, i.e. before the dev server had bound it, so it never actually waited; feature suites only passed when the server won the race against the first navigation. It now waits until something is listening on the port. Because the timeout is now real, the default `timeout` rises from `5000` to `30000` to accommodate genuine dev-server cold starts (pass `timeout` explicitly if you want the old bound).
  - spawn failures (e.g. command not found) previously emitted `'error'` with no listener (both listeners were attached only after awaiting the port) and crashed the vitest worker with an uncaughtException; one of the two duplicate listeners also re-threw inside the handler. `launchDevServer` now rejects with a comprehensible error when the command cannot be spawned, when the process exits before ever listening, and when the port is not bound within the timeout.
  - a dev server that dies mid-suite was logged only under `DEBUG=1`, surfacing as opaque navigation timeouts; it is now logged unconditionally and evicted from the process cache, so `stopDevServers` teardown no longer throws on the dead entry and a later `launchDevServer` with the same key can relaunch.
- typing: the custom puppeteer matchers are now declared on vitest's `Matchers` interface (the vitest ≥ 3.2 augmentation point) instead of `Assertion`/`ExpectStatic`, which vitest 4 no longer merges — restoring `expect(page).toMatchTextContent(...)`-style typing under vitest 4.
- typing: the package no longer declares the global `context`; `@rvoh/dream-spec-helpers` (present in every psychic app) already declares the identical global, and the duplicate declaration is a TS2451 redeclare error in any program that type-checks both declarations together.
- internal: repair the long-broken `pnpm build:test-app` (never run in CI): remove the bogus `typeRoots` override that blocked `vitest/globals` resolution, fix test-app cors `origin` to psychic v3's `string | fn` type, and drop the CJS half of the test-app build — it cannot compile (ESM-only repo importing subpath exports under `moduleResolution: "Node"`) and type-checked an artifact the ESM-only publish build never produces.

## 3.2.3

- upgrade to pnpm@11.9.0; add strictDepBuilds: false and deny esbuild/puppeteer build scripts in pnpm-workspace.yaml

## 3.2.2

- switch to Github action publishing to npmjs.com

## 3.2.1

- `toMatchTextContent` / `toNotMatchTextContent` again match the **values** entered into form controls (`input` / `textarea`). The 3.2.0 rewrite that added `RegExp` support switched the underlying text query from Puppeteer's `::-p-text()` (which matched form-control values) to manual `innerText` extraction (which does not), silently dropping value matching and breaking specs that assert on a populated field. `getAllTextContentFromPage` now also collects `input` / `textarea` `.value`, restoring the previous behavior for both string and regex expectations.

## 3.2.0

- `toMatchTextContent` and `toNotMatchTextContent` now accept `RegExp` expectations, enabling direct case-insensitive text assertions such as `await expect(page).toMatchTextContent(/hello/i)`. The matcher typings now reflect the supported input shape (`string | RegExp`) instead of accepting `any`, and `toNotMatchTextContent` now forwards selector/timeout options through the Vitest matcher registration.

## 3.1.1

- `createPsychicServer` now boots the spec server once per worker instead of re-booting a new `PsychicServer` on every spec. The previous cache was dead code (`const _server = undefined`, never reassigned), so the `if (_server) return _server` guard never fired and each spec ran a fresh `PsychicServer.boot()` — re-running application initialization and churning database/websocket connections, which made suites slow and flaky under load (ephemeral-port/connection exhaustion surfacing as intermittent `400/404/405/500` responses on unrelated specs, and websocket-layer interference on HTTP requests). The booted server is now cached on `globalThis` so it survives the per-file module-registry reset that isolating runners (e.g. Vitest with the default `isolate: true`) perform between spec files.

## 3.1.0

- add `resetBrowserState()` — per-spec browser cleanup for suites that share one browser across spec files. Call it in `afterEach`: it clears `localStorage`/`sessionStorage`, clears cookies (JS-visible sweep on the current origin plus a browser-context pass for HttpOnly), and navigates to `about:blank`. Two wins: (1) real cross-spec isolation (the shared-browser setup otherwise leaks storage/cookies between specs), and (2) the `about:blank` navigation cancels in-flight requests, releasing server-side resources (e.g. a pooled DB client) so server teardown isn't blocked. Best-effort and a no-op when there is no open page, so it can never fail an unrelated spec's teardown. The shared browser is left open and reusable.

## 3.0.1

- patch vulnerable packages
- bump puppeteer to non-deprecated version

## 3.0.0

- bumps to psychic@v3, which has switched from express to koa. This does not functionally introduce breaking changes to psychic-spec-helpers, but it will only be compatible with psychic@v3, and fixes breaking changes under the hood from shifting to koa.

## 2.0.0

- bump to 2 to match Dream versioning

## 1.1.6

Fix controller spec request auto-filling of nested route params

## 1.1.5

Add "Openapi" prefix to all newly-exported type helpers, so that comparitive helpers can be defined within a user's application to take over the more succinct namespaces

## 1.1.4

export RequestBody and RequestQuery, ResponseBody and ResponseCodeForUri types, so that they can be used within psychic application unit tests to be used as type guards

## 1.1.1

- bump supertest to close [dependabot issue](https://github.com/rvohealth/psychic-spec-helpers/security/dependabot/20)

## 1.1.0

- update for Dream 1.4.0
