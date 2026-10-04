import type { Store } from './disk'
import { activeLink, type LinkRecord } from './links'
import { safeId } from './meta'
import { shareLink, shareOk, shareSig, shareTtl, signingKey } from './sign'

const json = Response.json
const missing = () => json({ error: { code: 'NOT_FOUND' } }, { status: 404 })

export function linkURL(origin: string, record: LinkRecord): string {
  const base = origin.replace(/\/$/, '')
  if (record.kind === 'request') return `${base}/r/${record.id}`
  return `${base}/s/${record.id}?exp=${record.expiresAt}&sig=${shareSig(record.id, record.expiresAt, signingKey)}`
}

export async function sharingRoutes(
  req: Request,
  store: Store,
  origin: string,
): Promise<Response | null> {
  const path = new URL(req.url).pathname
  if (req.method === 'GET' && path === '/v1/sharing') {
    const records = (await store.links.list()).filter(activeLink)
    const links = []
    for (const record of records) {
      if (record.kind === 'share') {
        const file = record.fileId ? await store.get(record.fileId) : null
        if (!file || file.deletedAt) continue
      }
      links.push({ ...record, url: linkURL(origin, record) })
    }
    return json({ links })
  }
  const revoke = /^\/v1\/sharing\/([^/]+)$/.exec(path)
  if (req.method === 'DELETE' && revoke?.[1]) {
    if (!safeId(revoke[1])) return missing()
    const record = await store.links.update(revoke[1], (current) => ({
      ...current,
      revokedAt: new Date().toISOString(),
    }))
    return record ? json({ ok: true }) : missing()
  }
  const share = /^\/v1\/files\/([^/]+)\/share$/.exec(path)
  if (req.method === 'GET' && share?.[1]) {
    if (!safeId(share[1])) return missing()
    const file = await store.get(share[1])
    if (!file || file.deletedAt) return missing()
    const record = newRecord('share', file.name, file.folder)
    record.fileId = file.id
    const signed = shareLink(origin, record.id, signingKey)
    record.expiresAt = signed.exp
    await store.links.put(record)
    return json({ ...signed, id: record.id })
  }
  if (req.method === 'POST' && path === '/v1/requests') {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return json({ error: { code: 'INVALID_REQUEST' } }, { status: 400 })
    }
    const folder =
      typeof body === 'object' && body !== null && 'folder' in body
        ? body.folder
        : null
    if (
      typeof folder !== 'string' ||
      !folder.trim() ||
      folder.length > 200 ||
      [...folder].some((character) => character.charCodeAt(0) < 32)
    ) {
      return json({ error: { code: 'INVALID_FOLDER' } }, { status: 400 })
    }
    const record = newRecord('request', folder.trim(), folder.trim())
    await store.links.put(record)
    return json({ ...record, url: linkURL(origin, record) }, { status: 201 })
  }
  return null
}

function newRecord(
  kind: LinkRecord['kind'],
  name: string,
  folder: string,
): LinkRecord {
  return {
    id: crypto.randomUUID(),
    kind,
    name,
    folder,
    createdAt: new Date().toISOString(),
    expiresAt: Math.floor(Date.now() / 1000) + shareTtl,
    opens: 0,
    uploads: 0,
  }
}

type PublicActions = {
  content(id: string, range: string | undefined): Promise<Response>
  upload(id: string, req: Request, folder: string): Promise<Response>
}

export async function publicSharing(
  req: Request,
  store: Store,
  actions: PublicActions,
): Promise<Response | null> {
  const url = new URL(req.url)
  const share = /^\/s\/([^/]+)(\/meta)?$/.exec(url.pathname)
  if (req.method === 'GET' && share?.[1]) {
    const id = share[1]
    if (
      !safeId(id) ||
      !shareOk(
        id,
        url.searchParams.get('exp'),
        url.searchParams.get('sig'),
        signingKey,
      )
    )
      return missing()
    const record = await store.links.get(id)
    if (
      !activeLink(record) ||
      record.kind !== 'share' ||
      !record.fileId ||
      record.expiresAt !== Number(url.searchParams.get('exp'))
    )
      return missing()
    const file = await store.get(record.fileId)
    if (!file || file.deletedAt) return missing()
    if (share[2]) {
      await store.links.update(id, (current) => ({
        ...current,
        opens: current.opens + 1,
      }))
      return json({
        id: file.id,
        name: file.name,
        bytes: file.bytes,
        kind: file.kind,
      })
    }
    return actions.content(file.id, req.headers.get('range') ?? undefined)
  }
  const request = /^\/r\/([^/]+)$/.exec(url.pathname)
  if (request?.[1] && (req.method === 'GET' || req.method === 'PUT')) {
    const id = request[1]
    if (!safeId(id)) return missing()
    const record = await store.links.get(id)
    if (!activeLink(record) || record.kind !== 'request') return missing()
    if (req.method === 'GET')
      return json({ folder: record.folder, expiresAt: record.expiresAt })
    const response = await actions.upload(
      `r-${crypto.randomUUID()}`,
      req,
      record.folder,
    )
    if (response.ok)
      await store.links.update(id, (current) => ({
        ...current,
        uploads: current.uploads + 1,
      }))
    return response
  }
  return null
}
