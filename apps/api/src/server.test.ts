import { describe, expect, test } from 'bun:test'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { diskStore } from './disk'
import { parseContentRange, parseRange, rangeHeader, safeId } from './meta'
import { handle } from './server'
import { shareLink } from './sign'

const auth = { authorization: 'Bearer dev' }

describe('range', () => {
  test('parses inclusive byte ranges', () => {
    expect(parseRange('bytes=0-99', 1000)).toEqual({ start: 0, end: 99 })
    expect(parseRange('bytes=10-', 20)).toEqual({ start: 10, end: 19 })
    expect(rangeHeader({ start: 0, end: 9 }, 100)).toBe('bytes 0-9/100')
    expect(parseContentRange('bytes 5-9/10')).toEqual({
      start: 5,
      end: 9,
      total: 10,
    })
    expect(safeId('clip')).toBe(true)
    expect(safeId('..')).toBe(false)
  })
})

describe('storage api', () => {
  test('lists, ranges, keeps, signs, and trashes files', async () => {
    const store = diskStore(await mkdtemp(join(tmpdir(), 'loft-api-')))
    const put = await handle(
      new Request('http://x/v1/files/clip/content', {
        method: 'PUT',
        headers: {
          ...auth,
          'x-loft-name': 'clip.mov',
          'x-loft-folder': 'Films',
        },
        body: 'abcdefghij',
      }),
      store,
    )
    expect(put.status).toBe(201)
    const listed = await handle(
      new Request('http://x/v1/files', { headers: auth }),
      store,
    )
    const body = (await listed.json()) as { files: { id: string }[] }
    expect(body.files[0]?.id).toBe('clip')
    const part = await handle(
      new Request('http://x/v1/files/clip/content', {
        headers: { ...auth, range: 'bytes=2-5' },
      }),
      store,
    )
    expect(part.status).toBe(206)
    expect(await part.text()).toBe('cdef')
    expect(
      (
        await handle(
          new Request('http://x/v1/files/clip/keep', {
            method: 'POST',
            headers: auth,
          }),
          store,
        )
      ).status,
    ).toBe(200)
    expect((await handle(new Request('http://x/s/clip'), store)).status).toBe(
      401,
    )
    const signed = shareLink('http://127.0.0.1:8787', 'clip', 'dev')
    const share = await handle(
      new Request(`http://x/s/clip?exp=${signed.exp}&sig=${signed.sig}`),
      store,
    )
    expect(share.status).toBe(200)
    const link = await handle(
      new Request('http://x/v1/files/clip/share', { headers: auth }),
      store,
    )
    expect(((await link.json()) as { url: string }).url).toContain(
      '/s/clip?exp=',
    )
    const gone = await handle(
      new Request('http://x/v1/files/clip', {
        method: 'DELETE',
        headers: auth,
      }),
      store,
    )
    expect(gone.status).toBe(200)
    const empty = await (
      await handle(new Request('http://x/v1/files', { headers: auth }), store)
    ).json()
    expect(empty).toEqual({ files: [] })
    const trash = await handle(
      new Request('http://x/v1/files?trash=1', { headers: auth }),
      store,
    )
    expect(
      ((await trash.json()) as { files: { id: string }[] }).files[0]?.id,
    ).toBe('clip')
    const back = await handle(
      new Request('http://x/v1/files/clip/restore', {
        method: 'POST',
        headers: auth,
      }),
      store,
    )
    expect(back.status).toBe(200)
    const drop = await handle(
      new Request('http://x/r/guest', {
        method: 'PUT',
        headers: { 'x-loft-name': 'notes.txt', 'content-type': 'text/plain' },
        body: 'hi',
      }),
      store,
    )
    expect(drop.status).toBe(201)
    const inbox = (await (
      await handle(new Request('http://x/v1/files', { headers: auth }), store)
    ).json()) as { files: { folder: string; id: string }[] }
    expect(
      inbox.files.some(
        (f) => f.folder === 'Requests' && f.id.startsWith('r-guest-'),
      ),
    ).toBe(true)
  })

  test('resumes uploads, checks etags, and reports account usage', async () => {
    const store = diskStore(await mkdtemp(join(tmpdir(), 'loft-api-')))
    const first = await handle(
      new Request('http://x/v1/files/clip/content', {
        method: 'PUT',
        headers: { ...auth, 'content-range': 'bytes 0-4/10' },
        body: 'abcde',
      }),
      store,
    )
    expect(first.status).toBe(201)
    const row = (await first.json()) as { etag: string }
    const bad = await handle(
      new Request('http://x/v1/files/clip/content', {
        method: 'PUT',
        headers: {
          ...auth,
          'if-match': 'nope',
          'content-range': 'bytes 5-9/10',
        },
        body: 'fghij',
      }),
      store,
    )
    expect(bad.status).toBe(412)
    const ok = await handle(
      new Request('http://x/v1/files/clip/content', {
        method: 'PUT',
        headers: {
          ...auth,
          'if-match': row.etag,
          'content-range': 'bytes 5-9/10',
        },
        body: 'fghij',
      }),
      store,
    )
    expect(ok.status).toBe(200)
    const full = await handle(
      new Request('http://x/v1/files/clip/content', { headers: auth }),
      store,
    )
    expect(await full.text()).toBe('abcdefghij')
    const me = await handle(
      new Request('http://x/v1/me', { headers: auth }),
      store,
    )
    const account = (await me.json()) as { bytes: number; files: number }
    expect(account.files).toBe(1)
    expect(account.bytes).toBe(10)
  })

  test('rejects missing bearer', async () => {
    const res = await handle(
      new Request('http://x/v1/files'),
      diskStore(await mkdtemp(join(tmpdir(), 'loft-api-'))),
    )
    expect(res.status).toBe(401)
  })

  test('accepts extra bearer tokens', async () => {
    process.env.LOFT_TOKENS = 'alt'
    const res = await handle(
      new Request('http://x/v1/me', {
        headers: { authorization: 'Bearer alt' },
      }),
      diskStore(await mkdtemp(join(tmpdir(), 'loft-api-'))),
    )
    expect(res.status).toBe(200)
    process.env.LOFT_TOKENS = ''
  })
})
