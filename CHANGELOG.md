## 3.0.1

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
