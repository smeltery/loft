import { describe, expect, test } from 'bun:test'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { diskStore } from './disk'
import { handle } from './server'
import { shareLink } from './sign'

const auth = { authorization: 'Bearer dev' }
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'loft-sharing-'))
  const store = diskStore(root)
  await handle(
    new Request('http://x/v1/files/private/content', {
      method: 'PUT',
      headers: { ...auth, 'x-loft-name': 'notes.txt' },
      body: 'private bytes',
    }),
    store,
  )
  return { root, store }
}

describe('managed sharing', () => {
  test('lists only issued links, persists, tracks opens and revokes access', async () => {
    const { root, store } = await fixture()
    const list = () =>
      handle(new Request('http://x/v1/sharing', { headers: auth }), store).then(
        (res) => res.json(),
      )
    expect(await list()).toEqual({ links: [] })
    const created = await handle(
      new Request('http://x/v1/files/private/share', { headers: auth }),
      store,
    )
    const link = (await created.json()) as { id: string; url: string }
    const restarted = diskStore(root)
    expect((await restarted.links.list()).length).toBe(1)
    const meta = new URL(link.url)
    meta.pathname += '/meta'
    const views = await Promise.all(
      Array.from({ length: 5 }, () => handle(new Request(meta), store)),
    )
    expect(views.every((res) => res.ok)).toBe(true)
    expect((await store.links.get(link.id))?.opens).toBe(5)
    const bytes = await handle(new Request(link.url), restarted)
    expect(await bytes.text()).toBe('private bytes')
    const revoked = await handle(
      new Request(`http://x/v1/sharing/${link.id}`, {
        method: 'DELETE',
        headers: auth,
      }),
      store,
    )
    expect(revoked.status).toBe(200)
    expect((await handle(new Request(link.url), restarted)).status).toBe(404)
    expect((await handle(new Request(meta), restarted)).status).toBe(404)
    expect(await list()).toEqual({ links: [] })
  })

  test('rejects expired, unissued, tampered and cross-file links', async () => {
    const { store } = await fixture()
    const unsigned = shareLink('http://x', 'private', 'dev')
    expect((await handle(new Request(unsigned.url), store)).status).toBe(404)
    const created = await handle(
      new Request('http://x/v1/files/private/share', { headers: auth }),
      store,
    )
    const link = (await created.json()) as { id: string; url: string }
    const tampered = new URL(link.url)
    tampered.searchParams.set('sig', 'wrong')
    expect((await handle(new Request(tampered), store)).status).toBe(404)
    tampered.pathname = '/s/private'
    expect((await handle(new Request(tampered), store)).status).toBe(404)
    await store.links.update(link.id, (record) => ({ ...record, expiresAt: 1 }))
    expect((await handle(new Request(link.url), store)).status).toBe(404)
  })

  test('requests enforce issuance, destination, expiry and revocation', async () => {
    const { root, store } = await fixture()
    const upload = (url: string) =>
      handle(
        new Request(url, {
          method: 'PUT',
          headers: {
            'x-loft-name': 'upload.txt',
            'x-loft-folder': 'Wrong destination',
          },
          body: 'hello',
        }),
        store,
      )
    expect((await upload('http://x/r/unissued')).status).toBe(404)
    const created = await handle(
      new Request('http://x/v1/requests', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ folder: 'Client Work' }),
      }),
      store,
    )
    expect(created.status).toBe(201)
    const link = (await created.json()) as { id: string; url: string }
    expect((await handle(new Request(link.url), diskStore(root))).status).toBe(
      200,
    )
    expect((await upload(link.url)).status).toBe(201)
    expect((await upload(link.url)).status).toBe(201)
    const files = (await store.list()).filter(
      (file) => file.name === 'upload.txt',
    )
    expect(files.length).toBe(2)
    expect(files.every((file) => file.folder === 'Client Work')).toBe(true)
    expect(files[0]?.id).not.toBe(files[1]?.id)
    expect((await store.links.get(link.id))?.uploads).toBe(2)
    await handle(
      new Request(`http://x/v1/sharing/${link.id}`, {
        method: 'DELETE',
        headers: auth,
      }),
      store,
    )
    expect((await upload(link.url)).status).toBe(404)
    await store.links.update(link.id, (record) => ({
      ...record,
      revokedAt: undefined,
      expiresAt: 1,
    }))
    expect((await upload(link.url)).status).toBe(404)
  })

  test('protects management and rejects invalid request destinations', async () => {
    const { store } = await fixture()
    for (const [path, method] of [
      ['/v1/sharing', 'GET'],
      ['/v1/requests', 'POST'],
      ['/v1/sharing/fake', 'DELETE'],
    ]) {
      expect(
        (await handle(new Request(`http://x${path}`, { method }), store))
          .status,
      ).toBe(401)
    }
    for (const body of ['no json', '{}', '{"folder":" "}', '{"folder":42}']) {
      expect(
        (
          await handle(
            new Request('http://x/v1/requests', {
              method: 'POST',
              headers: auth,
              body,
            }),
            store,
          )
        ).status,
      ).toBe(400)
    }
  })
})
