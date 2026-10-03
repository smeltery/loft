const primary = process.env.LOFT_TOKEN ?? 'dev'

export const signingKey = process.env.LOFT_SIGNING_KEY ?? primary

export function tokens(): Set<string> {
  const extra = (process.env.LOFT_TOKENS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return new Set([primary, ...extra])
}

export function bearer(req: Request): boolean {
  const header = req.headers.get('authorization') ?? ''
  if (!header.startsWith('Bearer ')) return false
  return tokens().has(header.slice(7))
}

export async function pace(bytes: number): Promise<void> {
  const bps = Number(process.env.LOFT_BPS ?? 0)
  if (bps > 0) await Bun.sleep((bytes / bps) * 1000)
}
