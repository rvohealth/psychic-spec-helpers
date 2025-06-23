import { IdType } from '@rvoh/dream'
import supertest, { Response } from 'supertest'
import { createPsychicServer } from '../index.js'
import fillOpenapiParams from './helpers/fillOpenapiParams.js'
import {
  ExtractOpenapiParams,
  RequestBody,
  RequestQueryParameters,
  ResponseBody,
  ResponseCodeForUri,
  RoutesWithHttpMethod,
} from './helpers/openapiTypeHelpers.js'
import { OpenapiSpecSession } from './OpenapiSpecSession.js'
import { SpecRequestOpts, SpecRequestOptsAll } from './SpecRequest.js'
import supersession, { HttpMethod } from './supersession.js'

export class OpenapiSpecRequest<OpenapiPaths = undefined> {
  // eslint-disable-next-line
  private PsychicServer: any
  // eslint-disable-next-line
  private server: any

  private _defaultHeaders: Record<string, string>
  public setDefaultHeaders(headers: Record<string, string>) {
    this._defaultHeaders = headers
    return this
  }

  // eslint-disable-next-line
  public async init(PsychicServer: any) {
    // eslint-disable-next-line
    this.PsychicServer = PsychicServer
    this.server ||= await createPsychicServer(PsychicServer)
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
     * const res = await request.get('/posts/{id}', 200, { id: '123' })
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
     * const res = await request.get('/posts/{id}', 200, { id: '123' })
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
     * const res = await request.get(
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
    opts?: Params['length'] extends 0 ? Query : Query & { [K in Params[number]]: string | IdType }
  ): Promise<OpenapiSpecResponse<JsonContent>> {
    return (await this.makeRequest(
      'get',
      fillOpenapiParams(uri, (opts || {}) as object),
      expectedStatus,
      opts as SpecRequestOptsAll
    )) as OpenapiSpecResponse<JsonContent>
  }

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
     * const res = await request.post('/posts/{id}', 200, { id: '123' })
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
     * const res = await request.post('/posts/{id}', 200, { id: '123' })
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
     * const res = await request.post(
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
          [K in Params[number]]: string | IdType
        }
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
     * const res = await request.put('/posts/{id}', 200, { id: '123', data: { name: 'new name' }})
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
     * const res = await request.put('/posts/{id}', 200, { id: '123', data: { name: 'new name' }})
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
     * const res = await request.put(
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
          [K in Params[number]]: string | IdType
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
     * const res = await request.patch('/posts/{id}', 200, { data: { name: 'new name' }})
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
     * const res = await request.patch('/posts/{id}', 200, { data: { name: 'new name' }})
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
     * const res = await request.patch(
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
          [K in Params[number]]: string | IdType
        }
  ): Promise<OpenapiSpecResponse<JsonContent>> {
    return await this.makeRequest(
      'patch',
      fillOpenapiParams(uri, opts!),
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
     * const res = await request.delete('/posts/{id}', 200, { id: '123' })
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
     * const res = await request.delete('/posts/{id}', 200, { id: '123' })
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
     * const res = await request.delete(
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
          [K in Params[number]]: string | IdType
        }
  ): Promise<OpenapiSpecResponse<JsonContent>> {
    return await this.makeRequest(
      'delete',
      fillOpenapiParams(uri, opts || {}),
      expectedStatus,
      opts as SpecRequestOptsAll
    )
  }

  public async session<
    const ProvidedHttpMethod extends HttpMethod,
    const Uri extends RoutesWithHttpMethod<
      OpenapiPaths,
      ProvidedHttpMethod & keyof OpenapiPaths[keyof OpenapiPaths]
    > &
      string,
    const ResponseCode extends ResponseCodeForUri<OpenapiPaths, Uri, ProvidedHttpMethod>,
    Params extends string[] & ExtractOpenapiParams<Uri>,
    JsonContent extends RequestBody<OpenapiPaths, ProvidedHttpMethod, Uri>,
    Query extends OpenapiSpecRequestOptsGet<RequestQueryParameters<OpenapiPaths, 'get', Uri>>,
  >(
    httpMethod: ProvidedHttpMethod,
    /**
     * The uri on your background you are trying to hit.
     * This should be a path, like '/users'.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const session = await request.session('post', '/sessions/{token}', 200, { token: '123' })
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
     * const session = await request.session('post', '/sessions/{token}', 200, { token: '123' })
     * ```
     */
    expectedStatus: ResponseCode,

    /**
     * An object containing the path fields required to
     * fill your uri in, as well as any additional
     * arguments, for the chosen HTTP verb, like `data`,
     * for example.
     *
     * ```ts
     * const request = new OpenapiSpecRequest<openapiPaths>()
     * const res = await request.session(
     *   'post',
     *   '/sessions/{token}',
     *   200,
     *   {
     *     token: '123',
     *
     *     // if non-get
     *     data: {
     *       ...request body here
     *     },
     *     // if get
     *     query: {
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
     * @param opts.query - query params you want to send up. Must match the
     *                     query parameters in the openapi document for this uri.
     *                     (Optional)
     *
     * @param opts.headers - headers you would like to send with your request.
     *                       (Optional)
     */
    opts?: (ProvidedHttpMethod extends 'get'
      ? OpenapiSpecRequestOptsGet<Query>
      : OpenapiSpecRequestOptsPost<JsonContent>) & {
      [K in Params[number]]: string | IdType
    }
  ): Promise<OpenapiSpecSession<OpenapiPaths>> {
    const postOpts = (opts || {}) as OpenapiSpecRequestOptsPost
    const getOpts = (opts || {}) as OpenapiSpecRequestOptsGet

    uri = fillOpenapiParams(uri, (opts || {}) as object) as Uri

    return await new Promise((accept, reject) => {
      createPsychicServer(this.PsychicServer)
        .then(server => {
          const session = supersession(server)

          // supersession is borrowed from a non-typescript repo, which
          // does not have strong types around http methods, so we need to any cast
          let req = session[(httpMethod || 'post') as 'post'](`/${uri.replace(/^\//, '')}`)

          if (postOpts.data) {
            req = req.send(postOpts.data)
          }

          req
            .expect(expectedStatus)
            .query(getOpts.query || {})
            .set({ ...this._defaultHeaders, ...postOpts.headers })
            .end((err: Error) => {
              if (err) return reject(err)

              return accept(
                new OpenapiSpecSession<OpenapiPaths>(session).setDefaultHeaders(
                  this._defaultHeaders
                )
              )
            })
        })
        .catch(err => {
          throw err
        })
    })
  }

  private async makeRequest(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    uri: string,
    expectedStatus: number,
    opts: SpecRequestOptsAll = {}
  ): Promise<OpenapiSpecResponse> {
    // TODO: find out why this is necessary. Currently, without initializing the server
    // at the beginning of the specs, supertest is unable to use our server to handle requests.
    // it gives the appearance of being an issue with a runaway promise (i.e. missing await)
    // but I can't find it anywhere, so I am putting this init method in as a temporary fix.
    if (!this.server)
      throw new Error(
        `
  ERROR:
    When making use of the send spec helper, you must first call "await specRequest.init(PsychicServer)"
    from a beforEach hook at the root of your specs.
`
      )

    if (expectedStatus === 500) {
      process.env.PSYCHIC_EXPECTING_INTERNAL_SERVER_ERROR = '1'
    }

    // eslint-disable-next-line
    const req = supertest.agent(this.server.expressApp)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OpenapiSpecResponse<Body = any> = Omit<Response, 'body'> & { body: Body }

export type OpenapiSpecRequestOptsGet<QueryMap = object> = QueryMap extends undefined
  ? SpecRequestOpts
  : SpecRequestOpts & {
      query?: QueryMap
    }

export interface OpenapiSpecRequestOptsPost<RequestBodyMap = object> extends SpecRequestOpts {
  data?: RequestBodyMap
}

export interface OpenapiSpecRequestSessionOpts<QueryMap = object, RequestBodyMap = object>
  extends SpecRequestOptsAll {
  httpMethod?: HttpMethod
  query?: QueryMap & object
  data?: RequestBodyMap & object
}
