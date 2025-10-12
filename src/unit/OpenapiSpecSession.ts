import fillOpenapiParams from './helpers/fillOpenapiParams.js'
import {
  ExtractOpenapiParams,
  RequestBody,
  RequestQueryParameters,
  ResponseBody,
  ResponseCodeForUri,
  RoutesWithHttpMethod,
} from './helpers/openapiTypeHelpers.js'
import {
  OpenapiSpecRequestOptsGet,
  OpenapiSpecRequestOptsPost,
  OpenapiSpecResponse,
} from './OpenapiSpecRequest.js'
import { SpecRequestOptsAll } from './SpecRequest.js'
import supersession from './supersession.js'

// like SpecRequest, but meant to be bound to an instance
// of supersession, enabling chained requests to collect cookies
export class OpenapiSpecSession<OpenapiPaths> {
  constructor(private _session: ReturnType<typeof supersession>) {}

  private _defaultHeaders: Record<string, string>
  public setDefaultHeaders(headers: Record<string, string>) {
    this._defaultHeaders = headers
    return this
  }

  public async get<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'get' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends ResponseCodeForUri<OpenapiPaths, Uri, 'get'>,
    Params extends string[] & ExtractOpenapiParams<Uri>,
    Query extends OpenapiSpecRequestOptsGet<RequestQueryParameters<OpenapiPaths, 'get', Uri>>,
    JsonContent extends ResponseBody<OpenapiPaths, 'get', Uri, ResponseCode>,
  >(
    /**
     * The uri on your background you are trying to hit.
     * This should be a path, like '/users'.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.get('/posts/{id}', 200, { id: '123' })
     * ```
     */
    uri: Uri,

    /**
     * The response status you are expecting to receive
     * when making this request. It will need to match
     * one of the accepted response statuses for the
     * provided uri in your openapi types
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.get('/posts/{id}', 200, { id: '123' })
     * ```
     */
    expectedStatus: ResponseCode,

    /**
     * An object containing the path fields required to
     * fill your uri in, as well as any additional GET
     * arguments, like `query`, for example.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.get(
     *   '/posts/{postId}/comments/{id}',
     *   200,
     *   {
     *     postId: '123',
     *     id: '456',
     *     query: {
     *       ...query params here
     *     }
     *   }
     * )
     * ```
     *
     * @param opts.query - query params you want to send up. Must match the
     *                    query params in the openapi document for this uri.
     *                    (Optional)
     *
     * @param opts.headers - headers you would like to send with your request.
     *                       (Optional)
     */
    opts?: Params['length'] extends 0 ? Query : Query & { [K in Params[number]]: string | number }
  ): Promise<OpenapiSpecResponse<JsonContent>> {
    return (await this.makeRequest(
      'get',
      fillOpenapiParams(uri, (opts || {}) as object),
      expectedStatus,
      opts as SpecRequestOptsAll
    )) as OpenapiSpecResponse<JsonContent>
  }

  //
  //
  //
  // begin: POST
  // has Params
  public async post<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'post' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends ResponseCodeForUri<OpenapiPaths, Uri, 'post'>,
    Params extends string[] & ExtractOpenapiParams<Uri>,
    RequestBodyJsonContent extends RequestBody<OpenapiPaths, 'post', Uri>,
    JsonContent extends ResponseBody<OpenapiPaths, 'post', Uri, ResponseCode>,
  >(
    /**
     * The uri on your background you are trying to hit.
     * This should be a path, like '/users'.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.post('/posts/{id}', 200, { id: '123' })
     * ```
     */
    uri: Uri,

    /**
     * The response status you are expecting to receive
     * when making this request. It will need to match
     * one of the accepted response statuses for the
     * provided uri in your openapi types
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.post('/posts/{id}', 200, { id: '123' })
     * ```
     */
    expectedStatus: ResponseCode,

    /**
     * An object containing the path fields required to
     * fill your uri in, as well as any additional POST
     * arguments, like `data`, for example.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.post(
     *   '/posts/{postId}/comments/{id}',
     *   200,
     *   {
     *     postId: '123',
     *     commentId: '456',
     *     data: {
     *       ...request body here
     *     },
     *     headers: {
     *       ...headers here
     *     },
     *   }
     * )
     * ```
     *
     * @param opts.data - request body data you want to send up. Must match the
     *                    requestBody shape in the openapi document for this uri.
     *                    (Optional)
     *
     * @param opts.headers - headers you would like to send with your request.
     *                       (Optional)
     */
    opts?: Params['length'] extends 0
      ? OpenapiSpecRequestOptsPost<RequestBodyJsonContent>
      : OpenapiSpecRequestOptsPost<RequestBodyJsonContent> & { [K in Params[number]]: string }
  ): Promise<OpenapiSpecResponse<JsonContent>> {
    return await this.makeRequest(
      'post',
      fillOpenapiParams(uri, opts || {}),
      expectedStatus,
      opts as SpecRequestOptsAll
    )
  }

  public async put<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'put' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends ResponseCodeForUri<OpenapiPaths, Uri, 'put'>,
    Params extends string[] & ExtractOpenapiParams<Uri>,
    JsonContent extends ResponseBody<OpenapiPaths, 'put', Uri, ResponseCode>,
    RequestBodyJsonContent extends RequestBody<OpenapiPaths, 'put', Uri>,
  >(
    /**
     * The uri on your background you are trying to hit.
     * This should be a path, like '/users'.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.put('/posts/{id}', 200, { id: '123', data: { name: 'new name' }})
     * ```
     */
    uri: Uri,

    /**
     * The response status you are expecting to receive
     * when making this request. It will need to match
     * one of the accepted response statuses for the
     * provided uri in your openapi types
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.put('/posts/{id}', 200, { id: '123', data: { name: 'new name' }})
     * ```
     */
    expectedStatus: ResponseCode,

    /**
     * An object containing the path fields required to
     * fill your uri in, as well as any additional PUT
     * arguments, like `data`, for example.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.put(
     *   '/posts/{id}/comments/{commentId}',
     *   200,
     *   {
     *     postId: '123',
     *     id: '456',
     *
     *     data: {
     *       ...request body here
     *     },
     *     headers: {
     *       ...headers here
     *     },
     *   }
     * )
     * ```
     *
     * @param opts.data - request body data you want to send up. Must match the
     *                    requestBody shape in the openapi document for this uri.
     *                    (Optional)
     *
     * @param opts.headers - headers you would like to send with your request.
     *                       (Optional)
     */
    opts?: Params['length'] extends 0
      ? OpenapiSpecRequestOptsPost<RequestBodyJsonContent>
      : OpenapiSpecRequestOptsPost<RequestBodyJsonContent> & {
          [K in Params[number]]: string | number
        }
  ): Promise<OpenapiSpecResponse<JsonContent>> {
    return await this.makeRequest(
      'put',
      fillOpenapiParams(uri, opts || {}),
      expectedStatus,
      opts as SpecRequestOptsAll
    )
  }

  public async patch<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'patch' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends ResponseCodeForUri<OpenapiPaths, Uri, 'patch'>,
    Params extends string[] & ExtractOpenapiParams<Uri>,
    JsonContent extends ResponseBody<OpenapiPaths, 'patch', Uri, ResponseCode>,
    RequestBodyJsonContent extends RequestBody<OpenapiPaths, 'patch', Uri>,
  >(
    /**
     * The uri on your background you are trying to hit.
     * This should be a path, like '/posts'.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.patch('/posts/{id}', 200, { data: { name: 'new name' }})
     * ```
     */
    uri: Uri,

    /**
     * The response status you are expecting to receive
     * when making this request. It will need to match
     * one of the accepted response statuses for the
     * provided uri in your openapi types
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.patch('/posts/{id}', 200, { data: { name: 'new name' }})
     * ```
     */
    expectedStatus: ResponseCode,

    /**
     * An object containing the path fields required to
     * fill your uri in, as well as any additional PATCH
     * arguments, like `data`, for example.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.patch(
     *   '/posts/{postId}/comments/{id}',
     *   200,
     *   {
     *     postId: '123',
     *     commentId: '456',
     *     data: {
     *       ...request body here
     *     },
     *     headers: {
     *       ...headers here
     *     },
     *   }
     * )
     * ```
     *
     * @param opts.data - request body data you want to send up. Must match the
     *                    requestBody shape in the openapi document for this uri.
     *                    (Optional)
     *
     * @param opts.headers - headers you would like to send with your request.
     *                       (Optional)
     */
    opts?: Params['length'] extends 0
      ? OpenapiSpecRequestOptsPost<RequestBodyJsonContent>
      : OpenapiSpecRequestOptsPost<RequestBodyJsonContent> & {
          [K in Params[number]]: string | number
        }
  ): Promise<OpenapiSpecResponse<JsonContent>> {
    return await this.makeRequest(
      'patch',
      fillOpenapiParams(uri, opts || {}),
      expectedStatus,
      opts as SpecRequestOptsAll
    )
  }

  public async delete<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'delete' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends ResponseCodeForUri<OpenapiPaths, Uri, 'delete'>,
    Params extends string[] & ExtractOpenapiParams<Uri>,
    JsonContent extends ResponseBody<OpenapiPaths, 'delete', Uri, ResponseCode>,
    RequestBodyJsonContent extends RequestBody<OpenapiPaths, 'delete', Uri>,
  >(
    /**
     * The uri on your background you are trying to hit.
     * This should be a path, like '/users'.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.delete('/posts/{id}', 200, { id: '123' })
     * ```
     */
    uri: Uri,

    /**
     * The response status you are expecting to receive
     * when making this request. It will need to match
     * one of the accepted response statuses for the
     * provided uri in your openapi types
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.delete('/posts/{id}', 200, { id: '123' })
     * ```
     */
    expectedStatus: ResponseCode,

    /**
     * An object containing the path fields required to
     * fill your uri in, as well as any additional DELETE
     * arguments, like `data`, for example.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.delete(
     *   '/posts/{postId}/comments/{commentId}',
     *   200,
     *   {
     *     postId: '123',
     *     commentId: '456',
     *     data: {
     *       ...request body here
     *     },
     *     headers: {
     *       ...headers here
     *     },
     *   }
     * )
     * ```
     *
     * @param opts.data - request body data you want to send up. Must match the
     *                    requestBody shape in the openapi document for this uri.
     *                    (Optional)
     *
     * @param opts.headers - headers you would like to send with your request.
     *                       (Optional)
     */
    opts?: Params['length'] extends 0
      ? OpenapiSpecRequestOptsPost<RequestBodyJsonContent>
      : OpenapiSpecRequestOptsPost<RequestBodyJsonContent> & {
          [K in Params[number]]: string | number
        }
  ): Promise<OpenapiSpecResponse<JsonContent>> {
    return await this.makeRequest(
      'delete',
      fillOpenapiParams(uri, opts || {}),
      expectedStatus,
      opts as SpecRequestOptsAll
    )
  }

  private async makeRequest(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    uri: string,
    expectedStatus: number,
    opts: SpecRequestOptsAll = {}
  ) {
    if (expectedStatus === 500) {
      process.env.PSYCHIC_EXPECTING_INTERNAL_SERVER_ERROR = '1'
    }

    const req = this._session
    let request = req[method](`/${uri.replace(/^\//, '')}`)
    request = request.set({ ...this._defaultHeaders, ...opts.headers })
    if (opts.query) request = request.query(opts.query)
    if (method !== 'get') request = request.send(opts.data)

    try {
      const res = await request.expect(expectedStatus)
      process.env.PSYCHIC_EXPECTING_INTERNAL_SERVER_ERROR = undefined
      return res
    } catch (err) {
      // without manually console logging, you get no stack trace here
      console.error(err)
      console.trace()

      process.env.PSYCHIC_EXPECTING_INTERNAL_SERVER_ERROR = undefined

      throw err
    }
  }
}
