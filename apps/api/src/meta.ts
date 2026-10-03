import { createHash } from 'node:crypto'

export type FileMeta = {
  id: string
  name: string
  folder: string
  kind: string
  bytes: number
  kept: boolean
  etag: string
  updatedAt: string
  deletedAt?: string
}

export type ByteRange = { start: number; end: number }

export function parseRange(
  header: string | undefined,
  size: number,
): ByteRange | null {
  if (!header) return null
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!m) return null
  const start = m[1] ? Number(m[1]) : 0
  const end = m[2] ? Number(m[2]) : size - 1
  if (!Number.isInteger(start) || !Number.isInteger(end)) return null
  if (start < 0 || end < start || end >= size) return null
  return { start, end }
}

export function rangeHeader(range: ByteRange, size: number): string {
  return `bytes ${range.start}-${range.end}/${size}`
}

export function parseContentRange(
  header: string | undefined,
): { start: number; end: number; total: number } | null {
  if (!header) return null
  const m = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(header.trim())
  if (!m) return null
  const start = Number(m[1])
  const end = Number(m[2])
  const total = Number(m[3])
  if (end < start || total <= end) return null
  return { start, end, total }
}

export function etagOf(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex').slice(0, 16)
}

export function safeId(id: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(id) && !id.includes('..')
}
