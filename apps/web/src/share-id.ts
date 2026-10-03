export function shareIdFrom(path: string, search: string): string | null {
  const fromPath = path.match(/^\/s\/([^/]+)\/?$/)
  if (fromPath?.[1]) return fromPath[1]
  return new URLSearchParams(search).get('s')
}

export function shareId(): string | null {
  if (typeof window === 'undefined') return null
  return shareIdFrom(window.location.pathname, window.location.search)
}

export function apiOrigin(): string {
  return import.meta.env.VITE_API ?? 'http://127.0.0.1:8787'
}
