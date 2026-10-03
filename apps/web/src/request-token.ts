export function requestTokenFrom(path: string, search: string): string | null {
  const fromPath = path.match(/^\/r\/([^/]+)\/?$/)
  if (fromPath?.[1]) return fromPath[1]
  return new URLSearchParams(search).get('r')
}

export function requestToken(): string | null {
  if (typeof window === 'undefined') return null
  return requestTokenFrom(window.location.pathname, window.location.search)
}
