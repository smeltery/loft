import { apiOrigin } from '../share-id'

export function savedToken(): string {
  return typeof window === 'undefined'
    ? 'dev'
    : (localStorage.getItem('loft-token') ?? 'dev')
}

export async function accountRequest<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (token) headers.set('authorization', `Bearer ${token}`)
  const response = await fetch(`${apiOrigin()}${path}`, { ...options, headers })
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        'Your access token was not accepted. Update it in settings.',
      )
    }
    throw new Error(
      `Loft could not complete this request (${response.status}). Try again.`,
    )
  }
  return response.json() as Promise<T>
}

export function errorMessage(error: unknown): string {
  return error instanceof TypeError
    ? 'Could not connect to Loft. Check your connection and try again.'
    : error instanceof Error
      ? error.message
      : 'Something went wrong. Try again.'
}
