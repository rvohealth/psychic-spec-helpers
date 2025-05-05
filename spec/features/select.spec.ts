describe('select', () => {
  it('succeeds when the selector is found', async () => {
    await select('#select-box', 'option 1')
  })

  it('fails when the selector is not found', async () => {
    await select('#select-box', 'option 1')
    await expect(async () => {
      await select('invalid selector', 'option 1')
    }).rejects.toThrow()
  })
})
