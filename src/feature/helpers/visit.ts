/**
 * Navigates the spec's Puppeteer `page` to `path` on the client app.
 *
 * ```ts
 * await visit('/places', { baseUrl: AppEnv.string('CLIENT_APP_HOST') })
 * ```
 *
 * @param path - the path to open, e.g. `'/places'`. The leading slash is optional.
 * @param opts.baseUrl - the origin of the client app the spec drives, e.g.
 *   `'http://localhost:3050'`. In a create-psychic app, pass
 *   `AppEnv.string('CLIENT_APP_HOST')`. There is no default: an app can launch
 *   several clients for its feature specs (create-psychic launches up to three),
 *   and only the spec knows which one it means.
 */
export default async function visit(path: string, { baseUrl }: { baseUrl: string }) {
  await page.goto(`${baseUrl}/${path.replace(/^\//, '')}`)
}
