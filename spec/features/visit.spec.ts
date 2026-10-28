describe('visit', () => {
  it('opens the path on http://localhost:3000 when no baseUrl is given', async () => {
    await visit('/')
    expect(page.url()).toEqual('http://localhost:3000/')
  })

  it('opens a path without a leading slash on the baseUrl it is given', async () => {
    await visit('not-here', { baseUrl: 'http://localhost:3000' })
    expect(page.url()).toEqual('http://localhost:3000/not-here')
  })
})
