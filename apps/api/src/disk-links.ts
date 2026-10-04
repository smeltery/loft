import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { linkStore, type LinkRecord } from './links'

export function diskLinks(root: string) {
  const directory = join(root, 'links')
  const ready = mkdir(directory, { recursive: true })
  const path = (id: string) => join(directory, `${id}.json`)
  return linkStore({
    async list() {
      await ready
      const names = await readdir(directory)
      return Promise.all(
        names
          .filter((name) => name.endsWith('.json'))
          .map(
            async (name) =>
              JSON.parse(
                await readFile(join(directory, name), 'utf8'),
              ) as LinkRecord,
          ),
      )
    },
    async get(id) {
      await ready
      try {
        return JSON.parse(await readFile(path(id), 'utf8')) as LinkRecord
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
        throw error
      }
    },
    async put(record) {
      await ready
      const temporary = `${path(record.id)}.${crypto.randomUUID()}.tmp`
      await writeFile(temporary, JSON.stringify(record))
      await rename(temporary, path(record.id))
    },
  })
}
