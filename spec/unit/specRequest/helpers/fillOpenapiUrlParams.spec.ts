import fillOpenapiParams from '../../../../src/unit/helpers/fillOpenapiParams.js'

describe('fillOpenapiUrlParams', () => {
  it('pushes params into a route', () => {
    expect(
      fillOpenapiParams('/users/{id}/pets/{petId}/posts/{postId}', {
        id: 1,
        petId: 2,
        postId: 3,
        otherId: 4,
      })
    ).toEqual('/users/1/pets/2/posts/3')
  })
})
