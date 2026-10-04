import { useState } from 'react'
import { accountRequest, errorMessage } from './api'
import { ResourceError, useAccountResource } from './resource'
import './sharing.css'

type Link = {
  id: string
  kind: 'share' | 'request'
  name: string
  folder: string
  url: string
  opens: number
  uploads: number
  expiresAt: number
}

export function SharingPage({ token }: { token: string }) {
  const { data, setData, loading, error, retry } = useAccountResource<{
    links: Link[]
  }>('/v1/sharing', token)
  const [kind, setKind] = useState<Link['kind']>('share')
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [failure, setFailure] = useState<string | null>(null)
  const [folder, setFolder] = useState('')
  async function revoke(link: Link) {
    setBusy(link.id)
    setFailure(null)
    setNotice('')
    try {
      await accountRequest(`/v1/sharing/${link.id}`, token, {
        method: 'DELETE',
      })
      setData((current) =>
        current
          ? { links: current.links.filter((row) => row.id !== link.id) }
          : current,
      )
      setNotice(
        link.kind === 'share' ? 'share link revoked' : 'file request closed',
      )
    } catch (error) {
      setFailure(errorMessage(error))
    } finally {
      setBusy(null)
    }
  }
  async function copy(link: Link) {
    setFailure(null)
    setNotice('')
    try {
      await navigator.clipboard.writeText(link.url)
      setNotice('link copied')
    } catch {
      setFailure('Could not copy the link. Select and copy the address below.')
      setNotice(link.url)
    }
  }
  async function create() {
    setBusy('create')
    setFailure(null)
    try {
      const link = await accountRequest<Link>('/v1/requests', token, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ folder: folder.trim() }),
      })
      setData((current) => ({ links: [...(current?.links ?? []), link] }))
      setFolder('')
      setNotice('file request created')
    } catch (error) {
      setFailure(errorMessage(error))
    } finally {
      setBusy(null)
    }
  }
  if (error) return <ResourceError message={error} retry={retry} />
  const links = data?.links.filter((link) => link.kind === kind) ?? []
  return (
    <>
      <fieldset className="sharing-tabs" aria-label="show">
        {(['share', 'request'] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            aria-pressed={kind === tab}
            onClick={() => setKind(tab)}
          >
            {tab === 'share' ? 'share links' : 'file requests'}
            {data
              ? ` · ${data.links.filter((link) => link.kind === tab).length}`
              : ''}
          </button>
        ))}
      </fieldset>
      {failure && (
        <p className="banner" role="alert">
          {failure}
        </p>
      )}
      {notice && (
        <p className="banner sharing-notice" role="status">
          {notice}
        </p>
      )}
      {loading ? (
        <article className="card" role="status">
          loading sharing…
        </article>
      ) : links.length ? (
        <article className="card">
          <ul className="account-files">
            {links.map((link) => (
              <li className="sharing-row" key={link.id}>
                <div className="row-text">
                  <span className="t">{link.name}</span>
                  <span className="s">
                    {link.kind === 'share'
                      ? `${link.opens} opens`
                      : `${link.uploads} uploads`}{' '}
                    · expires{' '}
                    {new Date(link.expiresAt * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="sharing-actions">
                  <button
                    type="button"
                    className="account-action"
                    onClick={() => void copy(link)}
                  >
                    copy link
                  </button>
                  <button
                    type="button"
                    className="account-action secondary"
                    disabled={busy !== null}
                    onClick={() => void revoke(link)}
                  >
                    {busy === link.id
                      ? 'saving…'
                      : link.kind === 'share'
                        ? 'revoke'
                        : 'close request'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </article>
      ) : (
        <article className="card">
          <div className="sharing-empty">
            <div className="sharing-icon" aria-hidden="true">
              <svg
                aria-hidden="true"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d={
                    kind === 'share'
                      ? 'm10 13 4-4M8 15l-2 2a4 4 0 0 0 6 5l4-4a4 4 0 0 0-5-6M16 9l2-2a4 4 0 0 0-6-5L8 6a4 4 0 0 0 5 6'
                      : 'M3 7h6l2-3h9v16H3V7Zm9 10V9m-3 3 3-3 3 3'
                  }
                />
              </svg>
            </div>
            <h3>
              {kind === 'share'
                ? 'no share links yet'
                : 'no open file requests'}
            </h3>
            <p className="muted">
              {kind === 'share'
                ? 'Links created with Copy Link in Loft appear here, along with their activity.'
                : 'Create a request so someone can upload files directly to a folder in your Loft.'}
            </p>
          </div>
        </article>
      )}
      {kind === 'request' && !loading && (
        <form
          className="card account-form"
          onSubmit={(event) => {
            event.preventDefault()
            void create()
          }}
        >
          <label htmlFor="request-folder">destination folder</label>
          <input
            id="request-folder"
            value={folder}
            maxLength={200}
            required
            onChange={(event) => setFolder(event.target.value)}
            placeholder="Client Work"
          />
          <button
            type="submit"
            className="account-action"
            disabled={busy !== null || !folder.trim()}
          >
            create file request
          </button>
        </form>
      )}
    </>
  )
}
