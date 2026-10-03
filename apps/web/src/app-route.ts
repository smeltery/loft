export function appPathFrom(path: string): string | null {
  if (path === '/app' || path.startsWith('/app/')) return path
  return null
}

export function appPath(): string | null {
  if (typeof window === 'undefined') return null
  return appPathFrom(window.location.pathname)
}
