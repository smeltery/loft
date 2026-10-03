import type { Store } from './disk'
import type { FileMeta } from './meta'
import { staleTrash } from './sign'

type S3Like = {
  file(key: string): {
    json(): Promise<unknown>
    bytes(): Promise<Uint8Array>
    slice(start: number, end: number): { bytes(): Promise<Uint8Array> }
    write(data: Uint8Array | string): Promise<unknown>
    delete(): Promise<unknown>
  }
  list(opts: { prefix: string }): Promise<{ contents?: { key?: string }[] }>
}

export function s3Store(client: S3Like): Store {
  const metaKey = (id: string) => `meta/${id}.json`
  const blobKey = (id: string) => `blob/${id}`

  return {
    async list(trash = false) {
      const listed = await client.list({ prefix: 'meta/' })
      const rows: FileMeta[] = []
      for (const obj of listed.contents ?? []) {
        if (!obj.key?.endsWith('.json')) continue
        const meta = (await client.file(obj.key).json()) as FileMeta
        if (staleTrash(meta.deletedAt)) {
          await this.remove(meta.id)
          continue
        }
        if (Boolean(meta.deletedAt) !== trash) continue
        rows.push(meta)
      }
      return rows
    },
    async get(id) {
      try {
        return (await client.file(metaKey(id)).json()) as FileMeta
      } catch {
        return null
      }
    },
    async put(meta, body) {
      const next = {
        ...meta,
        bytes: body.byteLength,
        updatedAt: new Date().toISOString(),
      }
      await client.file(metaKey(meta.id)).write(JSON.stringify(next))
      await client.file(blobKey(meta.id)).write(body)
      return next
    },
    async read(id, start = 0, end?) {
      const meta = await this.get(id)
      if (!meta) return null
      const stop = (end ?? meta.bytes - 1) + 1
      const bytes = await client.file(blobKey(id)).slice(start, stop).bytes()
      return { meta, bytes }
    },
    async remove(id) {
      await client.file(metaKey(id)).delete()
      await client.file(blobKey(id)).delete()
    },
    async keep(id) {
      const meta = await this.get(id)
      if (!meta || meta.deletedAt) return null
      const next = { ...meta, kept: true, updatedAt: new Date().toISOString() }
      await client.file(metaKey(id)).write(JSON.stringify(next))
      return next
    },
    async trash(id) {
      const meta = await this.get(id)
      if (!meta) return null
      const next = {
        ...meta,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await client.file(metaKey(id)).write(JSON.stringify(next))
      return next
    },
    async restore(id) {
      const meta = await this.get(id)
      if (!meta) return null
      const next = {
        ...meta,
        deletedAt: undefined,
        updatedAt: new Date().toISOString(),
      }
      await client.file(metaKey(id)).write(JSON.stringify(next))
      return next
    },
  }
}
