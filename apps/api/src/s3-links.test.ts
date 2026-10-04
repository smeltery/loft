import { expect, test } from 'bun:test'
import { s3Store } from './s3'
import type { LinkRecord } from './links'

test('S3 link records persist, list and update without losing simultaneous counts', async () => {
  const objects = new Map<string, Uint8Array | string>()
  const client = {
    file(key: string) {
      return {
        async json() {
          const value = objects.get(key)
          if (value === undefined)
            throw Object.assign(new Error('missing'), { code: 'NoSuchKey' })
          return JSON.parse(
            typeof value === 'string' ? value : new TextDecoder().decode(value),
          )
        },
        async bytes() {
          return new Uint8Array()
        },
        slice() {
          return {
            async bytes() {
              return new Uint8Array()
            },
          }
        },
        async write(value: Uint8Array | string) {
          objects.set(key, value)
        },
        async delete() {
          objects.delete(key)
        },
      }
    },
    async list({
      prefix,
      continuationToken,
    }: {
      prefix: string
      continuationToken?: string
    }) {
      const keys = [...objects.keys()].filter((key) => key.startsWith(prefix))
      const offset = Number(continuationToken ?? 0)
      return {
        contents: keys.slice(offset, offset + 1).map((key) => ({ key })),
        isTruncated: offset + 1 < keys.length,
        nextContinuationToken:
          offset + 1 < keys.length ? String(offset + 1) : undefined,
      }
    },
  }
  const store = s3Store(client)
  expect(await store.links.get('missing')).toBeNull()
  const record: LinkRecord = {
    id: 'record',
    kind: 'request',
    folder: 'Films',
    name: 'Films',
    createdAt: new Date().toISOString(),
    expiresAt: 2_000_000_000,
    opens: 0,
    uploads: 0,
  }
  await store.links.put(record)
  expect(await s3Store(client).links.list()).toEqual([record])
  await Promise.all(
    Array.from({ length: 8 }, () =>
      store.links.update(record.id, (current) => ({
        ...current,
        uploads: current.uploads + 1,
      })),
    ),
  )
  expect((await store.links.get(record.id))?.uploads).toBe(8)
  await store.links.put({ ...record, id: 'second' })
  expect((await store.links.list()).map((link) => link.id)).toEqual([
    'record',
    'second',
  ])
  objects.set('links/broken.json', 'not JSON')
  await expect(store.links.get('broken')).rejects.toThrow()
})
