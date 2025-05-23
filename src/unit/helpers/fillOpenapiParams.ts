export default function fillOpenapiParams(url: string, params: object) {
  const matches = url.matchAll(/\{([^}]*)}/g)
  for (const match of matches) {
    const segment = match[1]
    url = url.replace(`{${segment}}`, params[segment as keyof typeof params])
  }
  return url
}
