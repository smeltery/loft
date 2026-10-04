export function legalPathFrom(path: string): 'privacy' | 'terms' | null {
  if (path === '/privacy') return 'privacy'
  if (path === '/terms') return 'terms'
  return null
}

export function legalPath(): 'privacy' | 'terms' | null {
  if (typeof window === 'undefined') return null
  return legalPathFrom(window.location.pathname)
}

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  return (
    <main className="notes wrap">
      <h1>{kind}</h1>
      <p>
        loft is a free self-hosted drive. this page exists so the marketing
        chrome matches the public product site. you run the storage api, so the
        files stay under your account.
      </p>
    </main>
  )
}
