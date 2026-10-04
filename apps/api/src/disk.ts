import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { FileMeta } from './meta'
import { staleTrash } from './sign'
import { diskLinks } from './disk-links'
import type { LinkStore } from './links'

export type Blob = { bytes: Uint8Array; meta: FileMeta }

export type Store = {
  links: LinkStore
  list(trash?: boolean): Promise<FileMeta[]>
  get(id: string): Promise<FileMeta | null>
  put(meta: FileMeta, body: Uint8Array): Promise<FileMeta>
  read(id: string, start?: number, end?: number): Promise<Blob | null>
  remove(id: string): Promise<void>
  keep(id: string): Promise<FileMeta | null>
  trash(id: string): Promise<FileMeta | null>
  restore(id: string): Promise<FileMeta | null>
}

export function diskStore(root: string): Store {
  const metaDir = join(root, 'meta')
  const blobDir = join(root, 'blob')
  const ready = mkdir(metaDir, { recursive: true }).then(() =>
    mkdir(blobDir, { recursive: true }),
  )

  const metaPath = (id: string) => join(metaDir, `${id}.json`)
  const blobPath = (id: string) => join(blobDir, id)

  async function writeMeta(meta: FileMeta) {
    await writeFile(metaPath(meta.id), JSON.stringify(meta))
  }

  return {
    links: diskLinks(root),
    async list(trash = false) {
      await ready
      const names = await readdir(metaDir)
      const rows: FileMeta[] = []
      for (const name of names) {
        if (!name.endsWith('.json')) continue
        const meta = JSON.parse(
          await readFile(join(metaDir, name), 'utf8'),
        ) as FileMeta
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
      await ready
      try {
        return JSON.parse(await readFile(metaPath(id), 'utf8')) as FileMeta
      } catch {
        return null
      }
    },
    async put(meta, body) {
      await ready
      const next = {
        ...meta,
        bytes: body.byteLength,
        etag: meta.etag,
        updatedAt: iso(),
      }
      await writeFile(metaPath(meta.id), JSON.stringify(next))
      await writeFile(blobPath(meta.id), body)
      return next
    },
    async read(id, start = 0, end?) {
      const meta = await this.get(id)
      if (!meta) return null
      const buf = await readFile(blobPath(id))
      const stop = end ?? buf.byteLength - 1
      return { meta, bytes: buf.subarray(start, stop + 1) }
    },
    async remove(id) {
      await ready
      await rm(metaPath(id), { force: true })
      await rm(blobPath(id), { force: true })
    },
    async keep(id) {
      const meta = await this.get(id)
      if (!meta || meta.deletedAt) return null
      const next = { ...meta, kept: true, updatedAt: iso() }
      await writeMeta(next)
      return next
    },
    async trash(id) {
      const meta = await this.get(id)
      if (!meta) return null
      const next = { ...meta, deletedAt: iso(), updatedAt: iso() }
      await writeMeta(next)
      return next
    },
    async restore(id) {
      const meta = await this.get(id)
      if (!meta) return null
      const next = { ...meta, deletedAt: undefined, updatedAt: iso() }
      await writeMeta(next)
      return next
    },
  }
}

function iso() {
  return new Date().toISOString()
}
