import { describe, expect, test } from 'bun:test'
import { shareLink, shareOk, staleTrash, trashMs } from './sign'

describe('signed share', () => {
  test('accepts a fresh hmac and rejects missing or expired', () => {
    const { exp, sig } = shareLink(
      'https://loft.example',
      'clip',
      'dev',
      1_700_000_000_000,
    )
    expect(shareOk('clip', String(exp), sig, 'dev', 1_700_000_000_000)).toBe(
      true,
    )
    expect(shareOk('clip', null, sig, 'dev')).toBe(false)
    expect(shareOk('clip', String(exp), 'nope', 'dev', 1_700_000_000_000)).toBe(
      false,
    )
    expect(shareOk('clip', String(exp), sig, 'dev', (exp + 1) * 1000)).toBe(
      false,
    )
  })

  test('purges trash after 30 days', () => {
    const now = Date.parse('2026-10-03T00:00:00Z')
    expect(staleTrash(new Date(now - trashMs - 1).toISOString(), now)).toBe(
      true,
    )
    expect(staleTrash(new Date(now - 1000).toISOString(), now)).toBe(false)
  })
})
