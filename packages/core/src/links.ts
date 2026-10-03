import { catalog, type DriveFile } from './catalog'

export function shareUrl(origin: string, file: DriveFile): string {
  return `${origin.replace(/\/$/, '')}/s/${file.id}`
}

export function requestUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, '')}/r/${token}`
}

export function searchDrive(query: string): DriveFile[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...catalog]
  return catalog.filter(
    (file) =>
      file.name.toLowerCase().includes(q) ||
      file.folder.toLowerCase().includes(q) ||
      file.kind.toLowerCase().includes(q),
  )
}

export function newRequestToken(): string {
  return crypto.randomUUID().slice(0, 8)
}
