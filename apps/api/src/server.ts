import { bearer, pace } from './auth'
import { diskStore, type Store } from './disk'
import {
  type ByteRange,
  type FileMeta,
  etagOf,
  parseContentRange,
  parseRange,
  rangeHeader,
  safeId,
} from './meta'
import { s3Store } from './s3'
import { publicSharing, sharingRoutes } from './sharing'

const port = Number(process.env.PORT ?? 8787)
const origin = process.env.LOFT_ORIGIN ?? `http://127.0.0.1:${port}`

export function makeStore(): Store {
  const bucket = process.env.LOFT_BUCKET
  if (bucket) {
    return s3Store(
      new Bun.S3Client({
        bucket,
        region: process.env.AWS_REGION ?? 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        endpoint: process.env.AWS_ENDPOINT,
      }) as unknown as Parameters<typeof s3Store>[0],
    )
  }
  return diskStore(process.env.LOFT_DATA ?? '.loft-data')
}

export function handle(req: Request, store: Store): Promise<Response> {
  return route(req, store)
    .catch((error: unknown) => {
      console.error(
        'Storage request failed',
        error instanceof Error ? error.message : 'unknown error',
      )
      return json({ error: { code: 'STORAGE_ERROR' } }, 500)
    })
    .then(cors)
}

async function route(req: Request, store: Store): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })
  const url = new URL(req.url)
  const path = url.pathname
  if (req.method === 'GET' && path === '/health') return json({ ok: true })
  const publicResponse = await publicSharing(req, store, {
    content: (id, range) => content(store, id, range),
    upload: (id, request, folder) => upload(store, id, request, folder),
  })
  if (publicResponse) return publicResponse
  if (!bearer(req)) return json({ error: { code: 'UNAUTHORIZED' } }, 401)
  const sharing = await sharingRoutes(
    req,
    store,
    process.env.LOFT_WEB ?? origin,
  )
  if (sharing) return sharing
  if (req.method === 'GET' && path === '/v1/me') {
    const files = await store.list()
    return json({
      email: process.env.LOFT_EMAIL ?? 'hello@loft.app',
      files: files.length,
      bytes: files.reduce((n, f) => n + f.bytes, 0),
    })
  }
  if (req.method === 'POST' && path === '/v1/trash/purge') {
    await store.list(true)
    return json({ ok: true })
  }
  if (req.method === 'GET' && path === '/v1/files') {
    return json({
      files: await store.list(url.searchParams.get('trash') === '1'),
    })
  }
  const action = /^\/v1\/files\/([^/]+)\/(keep|share|restore)$/.exec(path)
  if (action?.[1] && !safeId(action[1]))
    return json({ error: { code: 'NOT_FOUND' } }, 404)
  if (action?.[1] && action[2] === 'keep' && req.method === 'POST') {
    const kept = await store.keep(action[1])
    return kept ? json(kept) : json({ error: { code: 'NOT_FOUND' } }, 404)
  }
  if (action?.[1] && action[2] === 'restore' && req.method === 'POST') {
    const row = await store.restore(action[1])
    return row ? json(row) : json({ error: { code: 'NOT_FOUND' } }, 404)
  }
  const file = /^\/v1\/files\/([^/]+)(\/content)?$/.exec(path)
  const id = file?.[1]
  if (!id || !safeId(id)) return json({ error: { code: 'NOT_FOUND' } }, 404)
  const isContent = Boolean(file?.[2])
  if (req.method === 'GET' && isContent) {
    return content(store, id, req.headers.get('range') ?? undefined)
  }
  if (req.method === 'GET') {
    const meta = await store.get(id)
    return meta && !meta.deletedAt
      ? json(meta)
      : json({ error: { code: 'NOT_FOUND' } }, 404)
  }
  if (req.method === 'PUT' && isContent) return upload(store, id, req)
  if (req.method === 'DELETE') {
    const row = await store.trash(id)
    return row ? json(row) : json({ error: { code: 'NOT_FOUND' } }, 404)
  }
  return json({ error: { code: 'NOT_FOUND' } }, 404)
}

async function upload(
  store: Store,
  id: string,
  req: Request,
  forcedFolder?: string,
): Promise<Response> {
  const chunk = new Uint8Array(await req.arrayBuffer())
  const current = await store.get(id)
  const match = req.headers.get('if-match')
  if (current && match && match !== '*' && match !== current.etag) {
    return json({ error: { code: 'PRECONDITION_FAILED' } }, 412)
  }
  const part = parseContentRange(req.headers.get('content-range') ?? undefined)
  let body = chunk
  if (part) {
    const buf = new Uint8Array(part.total)
    const prior = current ? await store.read(id) : null
    if (prior)
      buf.set(
        prior.bytes.subarray(0, Math.min(prior.bytes.byteLength, part.total)),
      )
    buf.set(chunk, part.start)
    body = buf
  }
  const name = req.headers.get('x-loft-name') ?? current?.name ?? id
  const kind =
    req.headers.get('content-type') ??
    current?.kind ??
    'application/octet-stream'
  const meta: FileMeta = {
    id,
    name,
    folder:
      forcedFolder ??
      req.headers.get('x-loft-folder') ??
      current?.folder ??
      'Inbox',
    kind,
    bytes: body.byteLength,
    kept: current?.kept ?? false,
    etag: etagOf(body),
    updatedAt: new Date().toISOString(),
  }
  return json(await store.put(meta, body), current ? 200 : 201)
}

async function content(
  store: Store,
  id: string,
  rangeHeaderIn: string | undefined,
): Promise<Response> {
  const meta = await store.get(id)
  if (!meta || meta.deletedAt)
    return json({ error: { code: 'NOT_FOUND' } }, 404)
  const range: ByteRange | null = parseRange(rangeHeaderIn, meta.bytes)
  const blob = await store.read(id, range?.start, range?.end)
  if (!blob) return json({ error: { code: 'NOT_FOUND' } }, 404)
  await pace(blob.bytes.byteLength)
  const headers = new Headers({
    'content-type': meta.kind,
    'accept-ranges': 'bytes',
    'content-length': String(blob.bytes.byteLength),
    'content-disposition': `inline; filename="${meta.name}"`,
    etag: meta.etag,
  })
  if (range) {
    headers.set('content-range', rangeHeader(range, meta.bytes))
    return new Response(blob.bytes as unknown as BodyInit, {
      status: 206,
      headers,
    })
  }
  return new Response(blob.bytes as unknown as BodyInit, { headers })
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status })
}

function cors(res: Response): Response {
  const headers = new Headers(res.headers)
  headers.set('access-control-allow-origin', '*')
  headers.set(
    'access-control-allow-headers',
    'authorization,content-type,range,content-range,if-match,x-loft-name,x-loft-folder',
  )
  headers.set('access-control-allow-methods', 'GET,PUT,POST,DELETE,OPTIONS')
  return new Response(res.body, { status: res.status, headers })
}

if (import.meta.main) {
  const store = makeStore()
  Bun.serve({ port, fetch: (req) => handle(req, store) })
  console.log(`loft api ${origin}`)
}
