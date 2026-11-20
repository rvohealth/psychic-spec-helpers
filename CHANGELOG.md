## 3.7.0

- New `toHaveValue(cssSelector, expected)` / `toNotHaveValue(cssSelector, unexpected)` assert what an input, textarea or select holds, retrying until `timeout` (4000ms by default, like `toHaveSelected`). They read the field's `value` property, so they see a value typed by the user or set by a script even when the `value` attribute was never updated (an uncontrolled input, a textarea), which `toHaveSelector('#x[value="…"]')` cannot. `expected` is a string (the whole value) or a RegExp. Only a field a user can see counts, by the same rule `toMatchTextContent` applies to field values (not under `display: none`, not `visibility: hidden` or `collapse`, not `type="hidden"`); the first such field matching the selector is read. A missing or hidden field fails in both directions, so a typo cannot pass. The failure names the selector, the expected value and the actual value.
- `toHaveChecked`, `toHaveUnchecked`, `toCheck` and `toUncheck` work on Radix and other ARIA checkboxes, radios and switches, wait for the state, and find more controls by their text. **Behaves differently:**
  - They read a control's state from its native `checked` property or, for an element without one (a Radix `button[role="checkbox"]`, `role="radio"` or `role="switch"`), from `aria-checked`, like Playwright's `toBeChecked`. Before, such a control always read as unchecked: `toHaveUnchecked` passed on a checked Radix control, `toHaveChecked` failed, and `toUncheck` failed with "already unchecked". Now a `toHaveUnchecked` on a checked Radix control fails, and so does one on an `aria-checked="mixed"` control, which is neither checked nor unchecked (`toHaveChecked` fails on it too). An element with neither a `checked` property nor `aria-checked` still counts as unchecked.
  - `toHaveChecked` and `toHaveUnchecked` retry until `timeout` (5000ms by default, the default they have always had) instead of reading the state once. A spec that expects one of them to fail now waits for the timeout before it does.
  - `toCheck` on a control that is already checked leaves it checked and passes; before, it clicked the label and so unchecked it. `toUncheck` on a control that is already unchecked passes without clicking; before, it failed with "A checkbox was found with …, but it is already unchecked". Otherwise each still clicks once, through the label as before.
  - Lookups that failed before may now find a control. The label lookup they have always used still comes first and decides whenever it names a control, exactly as before: the first label, in document order, whose text contains the given text; the CSS selector `#` + its `for` attribute; and the `visible`, `hidden` and `signal` options applied to that element. Only when that lookup finds nothing, Playwright's `getByLabel` rule finds the checkbox, radio or switch: a wrapping label, a `for` label, `aria-labelledby` or `aria-label`, ignoring case and extra whitespace. It now finds a control in a wrapping label, one whose label text sits in a child element of the label (`toHaveChecked`/`toHaveUnchecked` used to fail there), and one whose `for` value is not valid CSS, such as a React 18 `useId` id like `:r0:-form-item` (all four used to fail there). A control found this way is clicked directly; more than one such control fails, naming them. A label whose `for` names a missing element, and a label without `for` beside its input, still fail. `toCheck` and `toUncheck` give a label up to 3000ms to appear (as long as they have always waited for one) before they use that rule, so a control is not clicked while the label naming another is still rendering; a call whose text matches no label therefore fails after the larger of 3000ms and the timeout (5000ms by default) instead of after 3000ms.
  - Failure messages name the control and its actual state, or why no control was found.
- `launchBrowser` and `launchPage` launch Firefox with a fine, hover-capable mouse on every platform, by setting the Firefox prefs `ui.primaryPointerCapabilities` and `ui.allPointerCapabilities` to `6` (fine | hover). Headless Firefox before 161 on Linux (usually CI) reported no pointer at all, so CSS behind `@media (hover: hover)` (Tailwind v4 compiles `hover:` to it) or `(pointer: fine)` never applied there while it did on macOS and Windows, and a spec that hovered such an element passed locally and timed out in CI. Firefox 161 reports a mouse there natively (Mozilla Bug 2083712), and Playwright's desktop contexts report one on every engine and platform; Puppeteer cannot emulate these media features. **Behaves differently:** only on headless Linux Firefox before 161, `(hover: hover)`, `(any-hover: hover)`, `(pointer: fine)` and `(any-pointer: fine)` now match, and `(hover: none)`, `(pointer: none)` and `(any-pointer: none)` no longer do, in CSS and in `matchMedia`; a spec that relied there on the page's no-hover layout sees the mouse layout, as it already does on macOS. Elsewhere the prefs equal what Firefox already reports. The two prefs are merged under the caller's `extraPrefsFirefox`, as Playwright merges its default Firefox prefs: a pointer pref the caller passes wins, and every pref the caller passes reaches Firefox as before, so an app that already set these prefs itself is unaffected. Chrome launches (`browser: 'chrome'`) are unchanged. Signatures are unchanged.
- `toHaveSelector`'s docs show the attribute-selector pattern, e.g. `toHaveSelector('#venue-other[data-state="checked"]')` for a Radix control or `toHaveSelector('#place-name[value="Trailhead"]')` for a React-controlled input, and point to `toHaveChecked` and `toHaveValue` when a failure should show the actual state or value.
- The `data` docs on `OpenapiSpecRequest`'s and `OpenapiSpecSession`'s `post`, `put`, `patch` and `delete`, and on `OpenapiSpecRequest#session`, say when a request body is required instead of calling it optional. `data` is optional in the type, but an endpoint whose OpenAPI `requestBody` is `required` needs it; psychic 3.19 and later mark a body required when its schema rejects `{}`. Leaving it out sends no body: with request-body validation on for the endpoint the app responds 400, and with validation off (psychic's default) the endpoint receives no body and may succeed. The helpers do not enforce it. Types, signatures and behavior are unchanged.
- `toClickSelector`, `toClickButton`, `toClickLink`, `toClick` (and the `click*` globals), and the clicks `toCheck` and `toUncheck` make, retry a click that cannot reach its target yet. When a step before the mouse click fails, they find the target again and retry every 100ms until the timeout (5000ms by default, as before): the element was replaced by a re-render after it was found, or has no point on screen to click, like a button in a Radix Sheet or Dialog still sliding in from off-screen, which used to fail at once with Puppeteer's "Node is either not clickable or not an Element". A click that was sent to the page is never retried, even when Puppeteer then reports an error, so its effect happens at most once. A click that worked before works exactly as before on its first attempt: the matchers do not wait for a target to be enabled or to stop moving (a disabled button is still clicked at once, to no effect), and a moving target is clicked where it is when the click is sent. Failure messages now end with Puppeteer's reason, such as ``Waiting for selector `#save` failed`` or "Node is either not clickable or not an Element", and `toClickButton`'s says "clickable button" instead of "clickable link". **Behaves differently:** only for calls that failed before. An element that is found but can never be clicked (under `display: none`, zero-size, or off-screen for good) now fails near the end of the timeout instead of at once, so such a spec takes about as long as the timeout to fail; with `timeout: 0` (no limit) it no longer fails at all. A `toCheck` or `toUncheck` whose click failed now says why. Signatures and defaults are unchanged.

## 3.6.0

- On Firefox (the default browser, which Puppeteer drives over WebDriver BiDi), `resetBrowserState()` now waits for the page's in-flight requests to get their responses before it resets, for up to 2 seconds. A spec often ends right after an action whose request it never waited for. Before, the reset navigated to `about:blank` at once, which aborted the request in the browser while its handler kept running on the server, so a database write the handler made before responding could land after the next spec's database cleanup: an unrelated spec then failed in its `beforeEach`, or saw a row it never created. **Behaves differently:** every reset now takes about 100 ms longer, even with nothing in flight (Puppeteer's network-idle window). A reset that starts with a request in flight waits until that request's response headers arrive, up to the 2-second limit, so a spec that ended with a slow request runs that much longer. A page that holds a request open costs the full 2 seconds on every reset; the usual case is a socket.io client still long-polling before its websocket upgrade, which is socket.io's default unless the client sets `transports: ['websocket']`. Hitting the limit does not fail a spec on its own: the reset carries on as before. Because a reset can now take a little over 2 seconds, an app whose `afterEach` hook timeout (vitest's `hookTimeout`; the default is 10 seconds) is lower than that sees the hook time out, and should raise it. `localStorage` and `sessionStorage` are still cleared before the wait, as before, so a navigation to another origin that completes during the wait cannot leave the app origin's storage to the next spec; they are cleared again after the wait. A request the page sends during the wait (one chained off a response still in flight) therefore finds both stores already empty: one that reads an auth token from `localStorage` goes out without it. It still carries cookies, which are cleared only after the wait. On Chrome (CDP), the reset skips the wait and behaves as in 3.5.0, including the race above: Puppeteer's in-flight request count on Chrome never forgets a request that a navigation cancelled, so after the first one every later reset would wait the full 2 seconds. The signature (`resetBrowserState(): Promise<void>`) is unchanged.
- The 3.1.0 entry below, and `resetBrowserState`'s docs until now, said that the `about:blank` navigation releases server-side resources (e.g. a pooled database client) held by in-flight requests. It does not: navigating away aborts a request only in the browser, and its handler keeps running on the server. The wait above covers a handler's work up to its response; work it does after responding (a background job, a promise it doesn't await) is still not waited for.

## 3.5.0

- `toMatchTextContent` / `toNotMatchTextContent` now ignore hidden text consistently. Before, text hidden with `display: none` or the `hidden` attribute matched (as did any input value inside it, and `<input type="hidden">` values), while text hidden with `visibility: hidden` did not. The matchers now exclude all of it, along with `visibility: collapse`, closed `<dialog>`s and `<datalist>` options. **Breaks:** a spec that uses `toMatchTextContent` to find text the user cannot see, typically content that is in the DOM but not shown yet (a `display: none` toast, tab panel or accordion) or a hidden input's value. That spec now fails: wait for the content to be shown, or assert the element with `toHaveSelector`, which still counts hidden elements. Visible text, displayed form values, `text-transform`, RegExp and `selector` scoping behave as before, and `opacity: 0`, offscreen, clipped, zero-size and `aria-hidden` text still counts.
- `toEvaluate`'s declared callback type now matches its runtime: the callback returns `{ pass, actual }`, synchronously or asynchronously. **Breaks:** a callback that returns a bare boolean, as the old declaration asked for, no longer compiles. Such a callback never worked: `toEvaluate` always failed after its timeout, and `.not.toEvaluate` always passed.
- `toMatchTextContent` / `toNotMatchTextContent` ignore `<select>` menus: a menu is a form control, not page text. Firefox, the default browser, already left option labels out of the page's text, while Chrome included every label, even of hidden options. **Breaks:** a spec that matches an option label as text (in Chrome, or through an option's own text in Firefox). Assert on the menu with `toHaveSelected` instead.
- New `toHaveSelected(cssSelector, optionValue)` / `toHaveUnselected(cssSelector, optionValue)` assert which option of a `<select>` is selected. Like `toSelect`, they match the option's `value` attribute, not its label, so a spec can pass an enum value rather than its translated text. `toHaveUnselected` fails when the select or option is missing, so a typo cannot pass. Both retry until `timeout`, like the text matchers.
- `toSelect` / `select` name their second argument `optionValue` and document what it has always done: it matches an option's `value` attribute, not its label, and a value no option has selects nothing without failing (a single-choice select falls back to its first option).

## 3.4.2

- `specRequest`, `OpenapiSpecRequest` and their sessions bind the app under test to `127.0.0.1` before each request and close it afterwards. supertest bound with a wildcard `listen(0)` and connected to `127.0.0.1`, and on macOS that bind could take a port another process held on `127.0.0.1` only, so a request intermittently got that process's response (often an empty 401) instead of the app's. Linux refused that bind, so CI never saw it. A session no longer keeps a server listening between its requests. `SpecSession` and `OpenapiSpecSession` still accept a plain supertest agent in their constructors, used as before.
- fix: `specRequest.session(uri, status, { httpMethod: 'options' })` sends an OPTIONS request. It threw `session[...] is not a function` (and, before sessions were awaited directly, left the spec hanging until its timeout), because the session's agent options lived in a field named `options` that shadowed the OPTIONS method.
- maintenance: pnpm 12.14.0; `.npmrc` drops the `always-auth` line pnpm does not read; `CONTRIBUTING.md` rewritten.

## 3.4.1

- Support Node 24 while making Node 26 the primary CI runtime.

## 3.4.0

- `toHaveSelector` / `toNotHaveSelector` are now a literal, presence-only negation pair, ignoring visibility entirely. Previously `toHaveSelector` forwarded caller opts straight to `page.waitForSelector`, so a passed `{ visible: true }` made a present-but-hidden element fail; meanwhile `toNotHaveSelector` used `waitForSelector({ hidden: true })`, which only asserts invisibility, so a present-but-hidden element wrongly passed as "not there." `toHaveSelector` now strips `visible`/`hidden` from any forwarded opts before calling `waitForSelector`, and `toNotHaveSelector` now polls `page.$(selector)` until it returns `null`, asserting true DOM absence. A present-but-hidden element now passes `toHaveSelector` and fails `toNotHaveSelector`, as expected of a literal negation pair.

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
