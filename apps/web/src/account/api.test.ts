import { afterEach, describe, expect, test } from 'bun:test'
import { accountRequest, errorMessage } from './api'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('account requests', () => {
  test('sends the current token and preserves restore method and cancellation', async () => {
    const controller = new AbortController()
    let captured: RequestInit | undefined
    globalThis.fetch = (async (_url: unknown, options?: RequestInit) => {
      captured = options
      return Response.json({ id: 'restored-file' })
    }) as unknown as typeof fetch
    const result = await accountRequest(
      '/v1/files/restored-file/restore',
      'new-token',
      {
        method: 'POST',
        signal: controller.signal,
        headers: { 'x-request-id': 'restore-check' },
      },
    )
    expect(result).toEqual({ id: 'restored-file' })
    expect(captured?.method).toBe('POST')
    expect(captured?.signal).toBe(controller.signal)
    expect(new Headers(captured?.headers).get('authorization')).toBe(
      'Bearer new-token',
    )
    expect(new Headers(captured?.headers).get('x-request-id')).toBe(
      'restore-check',
    )
  })

  test('does not accept an authentication error as account data', async () => {
    globalThis.fetch = (async () =>
      Response.json(
        { error: 'unauthorized' },
        { status: 401 },
      )) as unknown as typeof fetch
    await expect(accountRequest('/v1/me', 'invalid')).rejects.toThrow(
      'access token was not accepted',
    )
  })

  test('does not treat a failed restore as success', async () => {
    globalThis.fetch = (async () =>
      new Response('internal detail', {
        status: 500,
      })) as unknown as typeof fetch
    await expect(
      accountRequest('/v1/files/file/restore', 'dev', { method: 'POST' }),
    ).rejects.toThrow('(500)')
  })

  test('offers a connection retry message for network failure', () => {
    expect(errorMessage(new TypeError('Failed to fetch'))).toBe(
      'Could not connect to Loft. Check your connection and try again.',
    )
  })
})
