describe('toSelect', () => {
  it('succeeds when the selector is found', async () => {
    await expect(page).toSelect('#select-box', 'option 1')
  })

  it('fails when the selector is not found', async () => {
    await expect(page).toSelect('#select-box', 'option 1')

    await expect(async () => {
      await expect(page).toSelect('invalid selector', 'option 1')
    }).rejects.toThrow()
  })
})
