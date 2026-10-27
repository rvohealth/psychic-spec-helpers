import { CLIENT_URL } from './helpers/clientUrl.js'

describe('visit', () => {
  it('opens the path on the client origin it is given', async () => {
    await visit('/', { baseUrl: CLIENT_URL })
    expect(page.url()).toEqual(`${CLIENT_URL}/`)
  })

  it('accepts a path without a leading slash', async () => {
    await visit('not-here', { baseUrl: CLIENT_URL })
    expect(page.url()).toEqual(`${CLIENT_URL}/not-here`)
  })

  it('requires the client origin', () => {
    expectTypeOf(visit).toBeCallableWith('/', { baseUrl: CLIENT_URL })
    // @ts-expect-error a spec must say which client app it drives
    expectTypeOf(visit).toBeCallableWith('/')
  })
})
