import { expect, test } from 'bun:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { diskStore } from './disk'
import { handle } from './server'

test('downloads complete multi-chunk files and rejects stale or invalid ranges', async () => {
  const root = await mkdtemp(join(tmpdir(), 'loft-download-'))
  try {
    const store = diskStore(root)
    const headers = { authorization: 'Bearer dev' }
    const url = 'http://loft.test/v1/files/large/content'
    const payload = Uint8Array.from({ length: 2_097_169 }, (_, i) => i % 251)
    const uploaded = await handle(
      new Request(url, { method: 'PUT', headers, body: payload }),
      store,
    )
    expect(uploaded.status).toBe(201)
    const { etag } = (await uploaded.json()) as { etag: string }
    const downloaded = new Uint8Array(payload.length)
    for (let start = 0; start < payload.length; start += 1_048_576) {
      const end = Math.min(start + 1_048_575, payload.length - 1)
      const response = await handle(
        new Request(url, {
          headers: {
            ...headers,
            range: `bytes=${start}-${end}`,
            'if-match': etag,
          },
        }),
        store,
      )
      expect(response.status).toBe(206)
      expect(response.headers.get('content-range')).toBe(
        `bytes ${start}-${end}/${payload.length}`,
      )
      expect(response.headers.get('etag')).toBe(etag)
      downloaded.set(new Uint8Array(await response.arrayBuffer()), start)
    }
    expect(downloaded).toEqual(payload)
    const stale = await handle(
      new Request(url, {
        headers: {
          ...headers,
          range: 'bytes=0-9',
          'if-match': 'stale-version',
        },
      }),
      store,
    )
    expect(stale.status).toBe(412)
    for (const range of ['bytes=9999999-', 'bytes=5-2', 'invalid']) {
      const response = await handle(
        new Request(url, { headers: { ...headers, range } }),
        store,
      )
      expect(response.status).toBe(416)
      expect(response.headers.get('content-range')).toBe(
        `bytes */${payload.length}`,
      )
    }
    const full = await handle(new Request(url, { headers }), store)
    expect(full.status).toBe(200)
    expect(new Uint8Array(await full.arrayBuffer())).toEqual(payload)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
