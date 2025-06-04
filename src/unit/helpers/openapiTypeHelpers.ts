export type GetOpenapiUrl<OpenapiPaths> = First<
  StrictOpenapiUrl<OpenapiPaths> | NonStrictOpenapiUrl<OpenapiPaths>
>

export type GetResolvedOpenapiUrl<OpenapiPaths, Url> = First<
  StrictOpenapiResolvedUrl<OpenapiPaths, Url> | NonStrictOpenapiResolvedUrl<OpenapiPaths, Url>
>

export type StrictOpenapiUrl<OpenapiPaths> = OpenapiPaths extends undefined
  ? string
  : keyof OpenapiPaths & string

export type NonStrictOpenapiUrl<OpenapiPaths> = OpenapiPaths extends undefined
  ? string
  : ReplacePathParams<keyof OpenapiPaths & string>

export type StrictOpenapiResolvedUrl<OpenapiPaths, Url> = OpenapiPaths extends undefined
  ? never
  : Url extends keyof OpenapiPaths & string
    ? Url
    : never

export type NonStrictOpenapiResolvedUrl<OpenapiPaths, Url> = OpenapiPaths extends undefined
  ? string
  : Url extends string
    ? First<ExtractPathParams<Url, OpenapiPaths>>
    : never

export type First<T> = T extends infer U ? U : never

export type ExtractPathParams<Route, OpenapiPaths> = Route extends keyof OpenapiPaths
  ? Route
  : KeyOfType<PathDictionary<OpenapiPaths>, Route> extends keyof OpenapiPaths & string
    ? KeyOfType<PathDictionary<OpenapiPaths>, Route> & string
    : never

export type PathDictionary<OpenapiPaths> = {
  [K in keyof OpenapiPaths & string]: ReplacePathParams<K>
}

export type ReplacePathParams<Route extends string> =
  Route extends `${infer Start}{${string}}/${infer Rest}`
    ? `${Start}${RequestURISegment}/${ReplacePathParams<Rest>}`
    : Route extends `${string}{${string}}/`
      ? never
      : Route extends `${infer Start}{${string}}`
        ? `${Start}${RequestURISegment}`
        : Route

export type ExtractOpenapiParams<
  Route extends string,
  Params extends string[] = [],
> = Route extends `${string}{${infer Param}}/${infer Rest}`
  ? ExtractOpenapiParams<Rest, [...Params, Param]>
  : Route extends `${string}{${infer Param}}`
    ? [...Params, Param]
    : Params

type KeyOfType<T, U> = {
  [K in keyof T]: U extends T[K] ? K : never
}[keyof T]

export type ExcludeNever<T> = {
  [K in keyof T]: T[K] extends never ? never : T[K]
}

type FilterOutNever<T> = {
  [K in keyof T]: T[K] extends { [key: string]: never } ? never : T[K]
}

export type RoutesWithHttpMethod<
  T,
  HttpMethod extends keyof T[keyof T],
  R = {
    [K in keyof FilterOutNever<T>]: T[K][HttpMethod & keyof T[K]] extends object ? K : never
  },
> = R[keyof R]

export type RequestQueryParameters<
  OpenapiPaths,
  HttpMethod,
  Uri,
  // ResponseCode,
  HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths] = OpenapiPaths[Uri &
    keyof OpenapiPaths],
  ParametersMap extends HttpMethodMap[HttpMethod & keyof HttpMethodMap]['parameters' &
    keyof HttpMethodMap[HttpMethod & keyof HttpMethodMap]] = HttpMethodMap[HttpMethod &
    keyof HttpMethodMap]['parameters' & keyof HttpMethodMap[HttpMethod & keyof HttpMethodMap]],
  QueryMap extends ParametersMap['query' & keyof ParametersMap] = ParametersMap['query' &
    keyof ParametersMap],
> = QueryMap

export type ResponseBody<
  OpenapiPaths,
  HttpMethod,
  Uri,
  ResponseCode,
  HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths] = OpenapiPaths[Uri &
    keyof OpenapiPaths],
  ResponseMap extends HttpMethodMap[HttpMethod & keyof HttpMethodMap]['responses' &
    keyof HttpMethodMap[HttpMethod & keyof HttpMethodMap]] = HttpMethodMap[HttpMethod &
    keyof HttpMethodMap]['responses' & keyof HttpMethodMap[HttpMethod & keyof HttpMethodMap]],
  Content extends ResponseMap extends undefined
    ? undefined
    : ResponseCode extends undefined
      ? undefined
      : ResponseCode extends number
        ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
            keyof ResponseMap[ResponseCode & keyof ResponseMap]]
        : undefined = ResponseMap extends undefined
    ? undefined
    : ResponseCode extends undefined
      ? undefined
      : ResponseCode extends number
        ? ResponseMap[ResponseCode & keyof ResponseMap]['content' &
            keyof ResponseMap[ResponseCode & keyof ResponseMap]]
        : undefined,
  JsonContent extends Content extends undefined
    ? undefined
    : Content['application/json' & keyof Content] = Content extends undefined
    ? undefined
    : Content['application/json' & keyof Content],
> = JsonContent

export type RequestBody<
  OpenapiPaths,
  HttpMethod,
  Uri,
  HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths] = OpenapiPaths[Uri &
    keyof OpenapiPaths],
  UriPayload extends HttpMethodMap[HttpMethod & keyof HttpMethodMap] = HttpMethodMap[HttpMethod &
    keyof HttpMethodMap],
  RequestBodyMap extends UriPayload['requestBody' & keyof UriPayload] extends never
    ? undefined
    : UriPayload['requestBody' & keyof UriPayload] = UriPayload['requestBody' &
    keyof UriPayload] extends never
    ? undefined
    : UriPayload['requestBody' & keyof UriPayload],
  RequestBodyContent extends RequestBodyMap extends undefined
    ? undefined
    : RequestBodyMap['content' & keyof RequestBodyMap] = RequestBodyMap extends undefined
    ? undefined
    : RequestBodyMap['content' & keyof RequestBodyMap],
  RequestBodyJsonContent extends RequestBodyContent extends undefined
    ? undefined
    : RequestBodyContent['application/json' &
        keyof RequestBodyContent] = RequestBodyContent extends undefined
    ? undefined
    : RequestBodyContent['application/json' & keyof RequestBodyContent],
> = RequestBodyJsonContent

export type ResponseCodeForUri<
  OpenapiPaths,
  Uri,
  HttpMethod,
  HttpMethodMap extends OpenapiPaths[Uri & keyof OpenapiPaths] = OpenapiPaths[Uri &
    keyof OpenapiPaths],
  ResponseMap extends HttpMethodMap[HttpMethod & keyof HttpMethodMap]['responses' &
    keyof HttpMethodMap[HttpMethod & keyof HttpMethodMap]] = HttpMethodMap[HttpMethod &
    keyof HttpMethodMap]['responses' & keyof HttpMethodMap[HttpMethod & keyof HttpMethodMap]],
> = keyof ResponseMap & number

type RequestURISegment = string extends `${string}/${string}` ? never : string
