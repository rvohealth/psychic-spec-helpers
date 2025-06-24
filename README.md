# Psychic spec helpers

This repo provides spec helpers to be used in conjunction with the [psychic web framework](https://github.com/rvohealth/psychic).

## Getting started

1. Add this repo as a dev dependency in your psychic project (this is done by default for psychic apps, but worth mentioning in case it has been removed from your repo).

```bash
yarn add --dev @rvoh/psychic-spec-helpers
```

2. import psychic spec helpers in your jest setup. This is automatically set up when provisioning a new psychic app, so you should only need to do this with an a-typical setup.

```ts
// spec/unit/setup/hooks.ts
import "@rvoh/psychic-spec-helpers";
...
```

3. import and use the provided spec helpers:

```ts
import { specRequest as request } from '@rvoh/psychic-spec-helpers'
import { PsychicController } from '@rvoh/psychic'

describe('V1/Host/PlacesController', () => {
  let user: User
  let host: Host

  beforeEach(async () => {
    await request.init(PsychicServer)
    user = await createUser()
  })

  describe('GET index', () => {
    function subject(expectedStatus: number = 200) {
      return request.get('/v1/host/places', expectedStatus, {
        headers: addEndUserAuthHeader(request, user, {}),
      })
    }

    it('returns the index of Places', async () => {
      const place = await createPlace({ style: 'cabin', name: 'My cabin' })
      await createHostPlace({ host, place })
      const results = (await subject()).body

      expect(results).toEqual([
        expect.objectContaining({
          id: place.id,
          style: 'cabin',
          name: 'My cabin',
        }),
      ])
    })
  })
})
```

## Questions?

- **Ask them on [Stack Overflow](https://stackoverflow.com)**, using the `[psychic]` tag.

## Contributing

Psychic is an open source library, so we encourage you to actively contribute. Visit our [Contributing](https://github.com/rvohealth/psychic-spec-helpers/CONTRIBUTING.md) guide to learn more about the processes we use for submitting pull requests or issues.

Are you trying to report a possible security vulnerability? Visit our [Security Policy](https://github.com/rvohealth/psychic-spec-helpers/SECURITY.md) for guidelines about how to proceed.
