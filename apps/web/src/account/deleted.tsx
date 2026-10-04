import { useState } from 'react'
import { formatSize } from '@loft/core'
import { accountRequest, errorMessage } from './api'
import { ResourceError, useAccountResource } from './resource'

type DeletedFile = { id: string; name: string; folder: string; bytes: number }

export function DeletedPage({ token }: { token: string }) {
  const { data, setData, error, loading, retry } = useAccountResource<{
    files: DeletedFile[]
  }>('/v1/files?trash=1', token)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [restoreError, setRestoreError] = useState<string | null>(null)
  async function restore(file: DeletedFile) {
    setRestoring(file.id)
    setRestoreError(null)
    setNotice('')
    try {
      await accountRequest(
        `/v1/files/${encodeURIComponent(file.id)}/restore`,
        token,
        { method: 'POST' },
      )
      setData((current) =>
        current
          ? { files: current.files.filter((row) => row.id !== file.id) }
          : current,
      )
      setNotice(`${file.name} restored to ${file.folder}.`)
    } catch (error) {
      setRestoreError(errorMessage(error))
    } finally {
      setRestoring(null)
    }
  }
  if (error) return <ResourceError message={error} retry={retry} />
  if (loading || !data)
    return (
      <article className="card" role="status">
        loading deleted files…
      </article>
    )
  return (
    <>
      {notice && (
        <p className="banner" role="status">
          {notice}
        </p>
      )}
      {restoreError && (
        <p className="banner" role="alert">
          {restoreError}
        </p>
      )}
      {!data.files.length ? (
        <article className="card empty">
          <h3>nothing in deleted</h3>
          <p>files you delete stay for 30 days, then they’re gone.</p>
        </article>
      ) : (
        <article className="card">
          <div className="card-title">
            <h2>deleted files</h2>
          </div>
          <p className="faint">
            Restore files to their original folder within 30 days.
          </p>
          <ul className="account-files">
            {data.files.map((file) => (
              <li className="row" key={file.id}>
                <div className="row-text">
                  <span className="t">{file.name}</span>
                  <span className="s">
                    {file.folder} · {formatSize(file.bytes)}
                  </span>
                </div>
                <button
                  className="account-action"
                  type="button"
                  disabled={restoring !== null}
                  aria-label={`restore ${file.name}`}
                  onClick={() => void restore(file)}
                >
                  {restoring === file.id ? 'restoring…' : 'restore'}
                </button>
              </li>
            ))}
          </ul>
        </article>
      )}
    </>
  )
}
