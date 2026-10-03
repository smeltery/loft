import { createHmac, timingSafeEqual } from 'node:crypto'

export const trashMs = 30 * 24 * 60 * 60 * 1000
export const shareTtl = 7 * 24 * 60 * 60
export const signingKey =
  process.env.LOFT_SIGNING_KEY ?? process.env.LOFT_TOKEN ?? 'dev'

export function shareSig(id: string, exp: number, secret: string): string {
  return createHmac('sha256', secret)
    .update(`${id}.${exp}`)
    .digest('hex')
    .slice(0, 32)
}

export function shareLink(
  origin: string,
  id: string,
  secret: string,
  now = Date.now(),
): { url: string; exp: number; sig: string } {
  const exp = Math.floor(now / 1000) + shareTtl
  const sig = shareSig(id, exp, secret)
  const url = `${origin.replace(/\/$/, '')}/s/${id}?exp=${exp}&sig=${sig}`
  return { url, exp, sig }
}

export function shareOk(
  id: string,
  exp: string | null,
  sig: string | null,
  secret: string,
  now = Date.now(),
): boolean {
  if (!exp || !sig) return false
  const n = Number(exp)
  if (!Number.isInteger(n) || n < Math.floor(now / 1000)) return false
  const want = Buffer.from(shareSig(id, n, secret))
  const got = Buffer.from(sig)
  return want.length === got.length && timingSafeEqual(want, got)
}

export function staleTrash(
  deletedAt: string | undefined,
  now = Date.now(),
): boolean {
  if (!deletedAt) return false
  const t = Date.parse(deletedAt)
  return Number.isFinite(t) && now - t > trashMs
}
