export type LinkRecord = {
  id: string
  kind: 'share' | 'request'
  name: string
  folder: string
  fileId?: string
  createdAt: string
  expiresAt: number
  revokedAt?: string
  opens: number
  uploads: number
}

export type LinkStore = {
  list(): Promise<LinkRecord[]>
  get(id: string): Promise<LinkRecord | null>
  put(record: LinkRecord): Promise<void>
  update(
    id: string,
    change: (record: LinkRecord) => LinkRecord,
  ): Promise<LinkRecord | null>
}

type Backend = Pick<LinkStore, 'list' | 'get' | 'put'>

export function linkStore(backend: Backend): LinkStore {
  const pending = new Map<string, Promise<unknown>>()
  return {
    ...backend,
    async update(id, change) {
      const previous = pending.get(id) ?? Promise.resolve()
      const task = previous.then(async () => {
        const current = await backend.get(id)
        if (!current) return null
        const next = change(current)
        await backend.put(next)
        return next
      })
      // Keep later updates runnable after a failed write without hiding that failure.
      const settled = task.catch(() => undefined)
      pending.set(id, settled)
      try {
        return await task
      } finally {
        if (pending.get(id) === settled) pending.delete(id)
      }
    },
  }
}

export function activeLink(record: LinkRecord | null): record is LinkRecord {
  return (
    record !== null &&
    !record.revokedAt &&
    record.expiresAt > Math.floor(Date.now() / 1000)
  )
}
