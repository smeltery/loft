import { formatSize } from '@loft/core'
import { site } from '../copy'
import { ResourceError, useAccountResource } from './resource'

type Account = { email: string; files: number; bytes: number }

export function AccountPage({ token }: { token: string }) {
  const {
    data: me,
    error,
    loading,
    retry,
  } = useAccountResource<Account>('/v1/me', token)
  if (error) return <ResourceError message={error} retry={retry} />
  if (loading || !me)
    return (
      <article className="card" role="status">
        loading your account…
      </article>
    )
  return (
    <>
      <article className="card profile">
        <span className="avatar lg" aria-hidden="true">
          {me.email.charAt(0).toUpperCase()}
        </span>
        <div className="row-text">
          <span className="t">you</span>
          <span className="s">{me.email}</span>
        </div>
      </article>
      <article className="card">
        <div className="card-title">
          <h2>storage</h2>
        </div>
        <p className="big-num">
          {formatSize(me.bytes)} <small>in the cloud</small>
        </p>
        <p className="kv">
          <span>files</span>
          <span>{me.files.toLocaleString()}</span>
        </p>
        <p className="faint">
          Check the Loft app on your Mac for local storage usage.
        </p>
      </article>
      <article className="card">
        <div className="card-title">
          <h2>macs</h2>
          <a className="account-link" href={site.downloadHref}>
            get loft for mac
          </a>
        </div>
        <p className="muted">
          Get Loft on your Mac to browse your cloud files in Finder.
        </p>
        <p className="faint">
          Manage the drive and local storage from the Loft menu on each Mac.
        </p>
      </article>
    </>
  )
}
