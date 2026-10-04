import { useState } from 'react'
import { accountRequest, errorMessage } from './api'

export function SettingsPage({
  token,
  onSave,
}: {
  token: string
  onSave: (token: string) => void
}) {
  const [value, setValue] = useState(token)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  return (
    <>
      <article className="card">
        <div className="card-title">
          <h2>connection</h2>
        </div>
        <p className="muted">
          Connect this browser to your self-hosted Loft account.
        </p>
        <form
          className="account-form"
          onSubmit={async (event) => {
            event.preventDefault()
            setSaving(true)
            setError(null)
            setSaved(false)
            try {
              const next = value.trim()
              await accountRequest('/v1/me', next)
              localStorage.setItem('loft-token', next)
              setSaved(true)
              onSave(next)
            } catch (error) {
              setError(errorMessage(error))
            } finally {
              setSaving(false)
            }
          }}
        >
          <label htmlFor="access-token">access token</label>
          <input
            id="access-token"
            type="password"
            autoComplete="off"
            required
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            className="account-action"
            type="submit"
            disabled={saving || !value.trim()}
          >
            {saving ? 'connecting…' : 'save connection'}
          </button>
        </form>
        {error && <p role="alert">{error}</p>}
        {saved && <p role="status">connection saved</p>}
      </article>
      <article className="card">
        <div className="card-title">
          <h2>Finder</h2>
        </div>
        <p className="muted">Loft sits in Locations, next to Macintosh HD.</p>
        <p className="faint">
          To keep a file on your Mac, use its context menu in Finder. Local
          storage is managed on each Mac.
        </p>
      </article>
    </>
  )
}
