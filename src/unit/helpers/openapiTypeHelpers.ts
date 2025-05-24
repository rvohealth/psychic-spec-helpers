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

type RequestURISegment = string extends `${string}/${string}` ? never : string
