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
