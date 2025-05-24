import { IdType } from '@rvoh/dream'
import fillOpenapiParams from './helpers/fillOpenapiParams.js'
import {
  ExcludeNever,
  ExtractOpenapiParams,
  First,
  GetOpenapiUrl,
  GetResolvedOpenapiUrl,
  RoutesWithHttpMethod,
} from './helpers/openapiTypeHelpers.js'
import {
  OpenapiSpecRequestOptsGet,
  OpenapiSpecRequestOptsPost,
  OpenapiSpecResponse,
} from './OpenapiSpecRequest.js'
import supersession from './supersession.js'
import { SpecRequestOptsAll } from './SpecRequest.js'

// like SpecRequest, but meant to be bound to an instance
// of supersession, enabling chained requests to collect cookies
export class OpenapiSpecSession<OpenapiPaths> {
  constructor(private _session: ReturnType<typeof supersession>) {}

  //
  //
  //
  // begin: GET
  // has Params
  public async get<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'get' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends keyof ResponseMap & number,
    HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths],
    ResponseMap extends HttpMethodMap['get' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['get' & keyof HttpMethodMap]],
    ParametersMap extends HttpMethodMap['get' & keyof HttpMethodMap]['parameters' &
      keyof HttpMethodMap['get' & keyof HttpMethodMap]],
    QueryMap extends ParametersMap['query' & keyof ParametersMap],
    Params extends string[] & ExtractOpenapiParams<Uri>,
    Content extends ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent extends Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
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
    opts: Params['length'] extends 0
      ? never
      : OpenapiSpecRequestOptsGet<QueryMap> & { [K in Params[number]]: string | IdType }
  ): Promise<OpenapiSpecResponse<JsonContent>>
  // doesn't have Params
  public async get<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'get' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends Params['length'] extends 0
      ? keyof ExcludeNever<ResponseMap> & number
      : never,
    HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths],
    ResponseMap extends HttpMethodMap['get' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['get' & keyof HttpMethodMap]],
    ParametersMap extends HttpMethodMap['get' & keyof HttpMethodMap]['parameters' &
      keyof HttpMethodMap['get' & keyof HttpMethodMap]],
    QueryMap extends ParametersMap['query' & keyof ParametersMap],
    Params extends string[] & ExtractOpenapiParams<Uri>,
    Content extends ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent extends Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
  >(
    /**
     * The uri on your background you are trying to hit.
     * This should be a path, like '/users'.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.get('/user', 200)
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
     * const res = await session.get('/user', 200)
     * ```
     */
    expectedStatus: ResponseCode,

    /**
     * Query params, headers, and other options to send with
     * your request.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.get(
     *   '/user',
     *   200,
     *   {
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
    opts?: OpenapiSpecRequestOptsGet<QueryMap>
  ): Promise<OpenapiSpecResponse<JsonContent>>
  // final
  public async get<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'get' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends keyof ExcludeNever<ResponseMap> & number,
    HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths],
    ResponseMap extends HttpMethodMap['get' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['get' & keyof HttpMethodMap]],
    Content extends ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent extends Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
  >(
    uri: Uri,
    expectedStatus: ResponseCode,
    opts: unknown
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
    const ResponseCode extends Params['length'] extends 0
      ? never
      : keyof ExcludeNever<ResponseMap> & number,
    HttpMethodMap extends OpenapiPaths[ResolvedUri & keyof OpenapiPaths],
    ResolvedUri extends First<GetResolvedOpenapiUrl<OpenapiPaths, Uri> & keyof OpenapiPaths>,
    Params extends string[] & ExtractOpenapiParams<Uri>,
    ResponseMap extends HttpMethodMap['post' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['post' & keyof HttpMethodMap]],
    Content extends ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent extends Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
    RequestBodyMap extends HttpMethodMap['post' & keyof HttpMethodMap]['requestBody' &
      keyof HttpMethodMap['post' & keyof HttpMethodMap]],
    RequestBodyContent extends RequestBodyMap extends undefined
      ? undefined
      : RequestBodyMap['content' & keyof RequestBodyMap],
    RequestBodyJsonContent extends RequestBodyContent extends undefined
      ? undefined
      : RequestBodyContent['application/json' & keyof RequestBodyContent],
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
    opts: OpenapiSpecRequestOptsPost<RequestBodyJsonContent> & { [K in Params[number]]: string }
  ): Promise<OpenapiSpecResponse<JsonContent>>
  // DOESNT have Params
  public async post<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'post' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends Params['length'] extends 0
      ? keyof ExcludeNever<ResponseMap> & number
      : never,
    HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths],
    Params extends string[] & ExtractOpenapiParams<Uri>,
    ResponseMap extends HttpMethodMap['post' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['post' & keyof HttpMethodMap]],
    Content extends ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent extends Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
    RequestBodyMap extends HttpMethodMap['post' & keyof HttpMethodMap]['requestBody' &
      keyof HttpMethodMap['post' & keyof HttpMethodMap]],
    RequestBodyContent extends RequestBodyMap extends undefined
      ? undefined
      : RequestBodyMap['content' & keyof RequestBodyMap],
    RequestBodyJsonContent extends RequestBodyContent extends undefined
      ? undefined
      : RequestBodyContent['application/json' & keyof RequestBodyContent],
  >(
    /**
     * The uri on your background you are trying to hit.
     * This should be a path, like '/users'.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.post('/user', 200)
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
     * const res = await session.post('/user', 200)
     * ```
     */
    expectedStatus: ResponseCode,

    /**
     * Data, headers, and other options to send with
     * your request.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.post(
     *   '/user',
     *   200,
     *   {
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
    opts?: Params['length'] extends 0 ? OpenapiSpecRequestOptsPost<RequestBodyJsonContent> : never
  ): Promise<OpenapiSpecResponse<JsonContent>>
  // final
  public async post<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'post' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends keyof ExcludeNever<ResponseMap> & number,
    HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths],
    ResponseMap = HttpMethodMap['post' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['post' & keyof HttpMethodMap]],
    Content = ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent = Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
  >(
    uri: Uri,
    expectedStatus: ResponseCode,
    opts: unknown = {}
  ): Promise<OpenapiSpecResponse<JsonContent>> {
    return await this.makeRequest('post', uri, expectedStatus, opts as SpecRequestOptsAll)
  }

  //
  //
  //
  // begin: PUT
  // has Params
  public async put<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'put' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends Params['length'] extends 0
      ? never
      : keyof ExcludeNever<ResponseMap> & number,
    HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths],
    Params extends string[] & ExtractOpenapiParams<Uri>,
    ResponseMap extends HttpMethodMap['put' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['put' & keyof HttpMethodMap]],
    Content extends ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent extends Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
    RequestBodyMap extends HttpMethodMap['put' & keyof HttpMethodMap]['requestBody' &
      keyof HttpMethodMap['put' & keyof HttpMethodMap]],
    RequestBodyContent extends RequestBodyMap extends undefined
      ? undefined
      : RequestBodyMap['content' & keyof RequestBodyMap],
    RequestBodyJsonContent extends RequestBodyContent extends undefined
      ? undefined
      : RequestBodyContent['application/json' & keyof RequestBodyContent],
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
    opts: Params['length'] extends 0
      ? never
      : OpenapiSpecRequestOptsPost<RequestBodyJsonContent> & {
          [K in Params[number]]: string | IdType
        }
  ): Promise<OpenapiSpecResponse<JsonContent>>
  // DOESNT have params
  public async put<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'put' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends Params['length'] extends 0
      ? keyof ExcludeNever<ResponseMap> & number
      : never,
    HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths],
    Params extends string[] & ExtractOpenapiParams<Uri>,
    ResponseMap extends HttpMethodMap['put' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['put' & keyof HttpMethodMap]],
    Content extends ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent extends Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
    RequestBodyMap extends HttpMethodMap['put' & keyof HttpMethodMap]['requestBody' &
      keyof HttpMethodMap['put' & keyof HttpMethodMap]],
    RequestBodyContent extends RequestBodyMap extends undefined
      ? undefined
      : RequestBodyMap['content' & keyof RequestBodyMap],
    RequestBodyJsonContent extends RequestBodyContent extends undefined
      ? undefined
      : RequestBodyContent['application/json' & keyof RequestBodyContent],
  >(
    /**
     * The uri on your background you are trying to hit.
     * This should be a path, like '/users'.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.put('/user', 200, { data: { name: 'new name' })
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
     * const res = await session.put('/user', 200, { data: { name: 'new name' })
     * ```
     */
    expectedStatus: ResponseCode,

    /**
     * An object containing the path fields required to
     * fill your uri in, as well as any additional PUT
     * arguments, like `data`, for example.
     *
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.put(
     *   '/user',
     *   200,
     *   {
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
    opts?: Params['length'] extends 0 ? OpenapiSpecRequestOptsPost<RequestBodyJsonContent> : never
  ): Promise<OpenapiSpecResponse<JsonContent>>
  // final
  public async put<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'put' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends keyof ExcludeNever<ResponseMap> & number,
    HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths],
    ResponseMap = HttpMethodMap['put' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['put' & keyof HttpMethodMap]],
    Content = ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent = Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
  >(
    uri: Uri,
    expectedStatus: ResponseCode,
    opts: unknown = {}
  ): Promise<OpenapiSpecResponse<JsonContent>> {
    return await this.makeRequest(
      'put',
      fillOpenapiParams(uri, opts || {}),
      expectedStatus,
      opts as SpecRequestOptsAll
    )
  }

  //
  //
  //
  // begin: PATCH
  // has Params
  public async patch<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'patch' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends Params['length'] extends 0
      ? never
      : keyof ExcludeNever<ResponseMap> & number,
    HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths],
    Params extends string[] & ExtractOpenapiParams<Uri>,
    ResponseMap extends HttpMethodMap['patch' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['patch' & keyof HttpMethodMap]],
    Content extends ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent extends Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
    RequestBodyMap extends HttpMethodMap['patch' & keyof HttpMethodMap]['requestBody' &
      keyof HttpMethodMap['patch' & keyof HttpMethodMap]],
    RequestBodyContent extends RequestBodyMap extends undefined
      ? undefined
      : RequestBodyMap['content' & keyof RequestBodyMap],
    RequestBodyJsonContent extends RequestBodyContent extends undefined
      ? undefined
      : RequestBodyContent['application/json' & keyof RequestBodyContent],
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
    opts: Params['length'] extends 0
      ? never
      : OpenapiSpecRequestOptsPost<RequestBodyJsonContent> & {
          [K in Params[number]]: string | IdType
        }
  ): Promise<OpenapiSpecResponse<JsonContent>>
  // DOESNT have params
  public async patch<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'patch' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends Params['length'] extends 0
      ? keyof ExcludeNever<ResponseMap> & number
      : never,
    HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths],
    Params extends string[] & ExtractOpenapiParams<Uri>,
    ResponseMap extends HttpMethodMap['patch' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['patch' & keyof HttpMethodMap]],
    Content extends ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent extends Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
    RequestBodyMap extends HttpMethodMap['patch' & keyof HttpMethodMap]['requestBody' &
      keyof HttpMethodMap['patch' & keyof HttpMethodMap]],
    RequestBodyContent extends RequestBodyMap extends undefined
      ? undefined
      : RequestBodyMap['content' & keyof RequestBodyMap],
    RequestBodyJsonContent extends RequestBodyContent extends undefined
      ? undefined
      : RequestBodyContent['application/json' & keyof RequestBodyContent],
  >(
    /**
     * The uri on your background you are trying to hit.
     * This should be a path, like '/user'.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.patch('/user', 200, { data: { name: 'new name' }})
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
     * const res = await session.patch('/user', 200, { data: { name: 'new name' }})
     * ```
     */
    expectedStatus: ResponseCode,

    /**
     * Data, headers, and other options to send with
     * your request.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.patch(
     *   '/user',
     *   200,
     *   {
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
    opts?: Params['length'] extends 0 ? OpenapiSpecRequestOptsPost<RequestBodyJsonContent> : never
  ): Promise<OpenapiSpecResponse<JsonContent>>
  // final
  public async patch<
    const Uri extends GetOpenapiUrl<OpenapiPaths>,
    const ResponseCode extends keyof ResponseMap & number,
    HttpMethodMap extends OpenapiPaths[ResolvedUri & keyof OpenapiPaths],
    ResolvedUri extends GetResolvedOpenapiUrl<OpenapiPaths, Uri> & keyof OpenapiPaths,
    ResponseMap extends HttpMethodMap['patch' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['patch' & keyof HttpMethodMap]],
    Content extends ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent extends Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
    RequestBodyMap extends HttpMethodMap['patch' & keyof HttpMethodMap]['requestBody' &
      keyof HttpMethodMap['patch' & keyof HttpMethodMap]],
    RequestBodyContent extends RequestBodyMap extends undefined
      ? undefined
      : RequestBodyMap['content' & keyof RequestBodyMap],
    RequestBodyJsonContent extends RequestBodyContent extends undefined
      ? undefined
      : RequestBodyContent['application/json' & keyof RequestBodyContent],
  >(
    uri: Uri,
    expectedStatus: ResponseCode,
    opts: OpenapiSpecRequestOptsPost<RequestBodyJsonContent> = {}
  ): Promise<OpenapiSpecResponse<JsonContent>> {
    return await this.makeRequest(
      'patch',
      fillOpenapiParams(uri, opts),
      expectedStatus,
      opts as SpecRequestOptsAll
    )
  }

  //
  //
  //
  // begin: delete
  // has Params
  public async delete<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'delete' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends Params['length'] extends 0
      ? never
      : keyof ExcludeNever<ResponseMap> & number,
    HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths],
    Params extends string[] & ExtractOpenapiParams<Uri>,
    ResponseMap extends HttpMethodMap['delete' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['delete' & keyof HttpMethodMap]],
    Content extends ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent extends Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
    RequestBodyMap extends HttpMethodMap['delete' & keyof HttpMethodMap]['requestBody' &
      keyof HttpMethodMap['delete' & keyof HttpMethodMap]],
    RequestBodyContent extends RequestBodyMap extends undefined
      ? undefined
      : RequestBodyMap['content' & keyof RequestBodyMap],
    RequestBodyJsonContent extends RequestBodyContent extends undefined
      ? undefined
      : RequestBodyContent['application/json' & keyof RequestBodyContent],
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
    opts: Params['length'] extends 0
      ? never
      : OpenapiSpecRequestOptsPost<RequestBodyJsonContent> & {
          [K in Params[number]]: string | IdType
        }
  ): Promise<OpenapiSpecResponse<JsonContent>>
  // DOESNT have params
  public async delete<
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      'delete' & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends Params['length'] extends 0
      ? keyof ExcludeNever<ResponseMap> & number
      : never,
    HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths],
    Params extends string[] & ExtractOpenapiParams<Uri>,
    ResponseMap extends HttpMethodMap['delete' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['delete' & keyof HttpMethodMap]],
    Content extends ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent extends Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
    RequestBodyMap extends HttpMethodMap['delete' & keyof HttpMethodMap]['requestBody' &
      keyof HttpMethodMap['delete' & keyof HttpMethodMap]],
    RequestBodyContent extends RequestBodyMap extends undefined
      ? undefined
      : RequestBodyMap['content' & keyof RequestBodyMap],
    RequestBodyJsonContent extends RequestBodyContent extends undefined
      ? undefined
      : RequestBodyContent['application/json' & keyof RequestBodyContent],
  >(
    /**
     * The uri on your background you are trying to hit.
     * This should be a path, like '/users'.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.delete('/user', 200)
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
     * const res = await session.delete('/user', 200)
     * ```
     */
    expectedStatus: ResponseCode,

    /**
     * Data, headers, and other options to send with
     * your request.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: 'abc' })
     * const res = await session.delete(
     *   '/user',
     *   200,
     *   {
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
    opts?: Params['length'] extends 0 ? OpenapiSpecRequestOptsPost<RequestBodyJsonContent> : never
  ): Promise<OpenapiSpecResponse<JsonContent>>
  // final
  public async delete<
    const Uri extends GetOpenapiUrl<OpenapiPaths>,
    const ResponseCode extends keyof ResponseMap & number,
    HttpMethodMap extends OpenapiPaths[ResolvedUri & keyof OpenapiPaths],
    ResolvedUri extends GetResolvedOpenapiUrl<OpenapiPaths, Uri> & keyof OpenapiPaths,
    ResponseMap = HttpMethodMap['delete' & keyof HttpMethodMap]['responses' &
      keyof HttpMethodMap['delete' & keyof HttpMethodMap]],
    Content = ResponseMap extends undefined
      ? undefined
      : ResponseCode extends undefined
        ? undefined
        : ResponseCode extends number
          ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
              keyof ResponseMap[ResponseCode & keyof ResponseMap]]
          : undefined,
    JsonContent = Content extends undefined
      ? undefined
      : Content['application/json' & keyof Content],
    RequestBodyMap = HttpMethodMap['delete' & keyof HttpMethodMap]['requestBody' &
      keyof HttpMethodMap['delete' & keyof HttpMethodMap]],
    RequestBodyContent = RequestBodyMap extends undefined
      ? undefined
      : RequestBodyMap['content' & keyof RequestBodyMap],
    RequestBodyJsonContent = RequestBodyContent extends undefined
      ? undefined
      : RequestBodyContent['application/json' & keyof RequestBodyContent],
  >(
    uri: Uri,
    expectedStatus: ResponseCode,
    opts: OpenapiSpecRequestOptsPost<RequestBodyJsonContent> = {}
  ): Promise<OpenapiSpecResponse<JsonContent>> {
    return await this.makeRequest(
      'delete',
      fillOpenapiParams(uri, opts),
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
    if (opts.headers) request = request.set(opts.headers)
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
