import { useEffect, useState } from 'react'
import { formatSize } from '@loft/core'
import { Logo } from './logo'
import { site } from './copy'
import { apiOrigin } from './share-id'
import './app.css'

const tabs: { href: string; label: string; sep?: boolean }[] = [
  { href: '/app', label: 'account' },
  { href: '/app/plan', label: 'plan' },
  { href: '/app/sharing', label: 'shared' },
  { href: '/app/settings', label: 'settings' },
  { href: '/app/deleted', label: 'deleted', sep: true },
]

type Me = { email: string; files: number; bytes: number }
type Remote = { id: string; name: string; folder: string }

function headers() {
  const token =
    typeof window === 'undefined'
      ? 'dev'
      : (localStorage.getItem('loft-token') ?? 'dev')
  return { authorization: `Bearer ${token}` }
}

export function AppShell({ path }: { path: string }) {
  return (
    <div className="app-body">
      <header className="a-top">
        <a className="brand" href="/app" aria-label={`${site.name} home`}>
          <Logo />
          <span>{site.name}</span>
        </a>
      </header>
      <main className="a-main">{page(path)}</main>
      <TokenField />
      <nav className="dock" aria-label="main">
        {tabs.map((tab) => (
          <span key={tab.href} className="dock-wrap">
            {tab.sep ? <i className="dock-sep" /> : null}
            <a
              href={tab.href}
              aria-current={path === tab.href ? 'page' : undefined}
            >
              <DockIcon name={tab.label} />
              <span>{tab.label}</span>
            </a>
          </span>
        ))}
      </nav>
    </div>
  )
}

function TokenField() {
  const [value, setValue] = useState('dev')
  useEffect(() => {
    setValue(localStorage.getItem('loft-token') ?? 'dev')
  }, [])
  return (
    <form
      className="banner"
      onSubmit={(e) => {
        e.preventDefault()
        localStorage.setItem('loft-token', value)
      }}
    >
      <label>
        token
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
        />
      </label>
    </form>
  )
}

function DockIcon({ name }: { name: string }) {
  const d =
    name === 'account'
      ? 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-8 2-8 6v1h16v-1c0-4-4-6-8-6Z'
      : name === 'plan'
        ? 'M4 6h16v12H4Zm2 3h12M6 12h8'
        : name === 'shared'
          ? 'M8 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm11 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3ZM3 19c0-2.5 2.2-4 5-4s5 1.5 5 4M13 19c0-1.6.7-2.8 2-3.5 1.2-.6 2.7-.5 4 .5'
          : name === 'settings'
            ? 'M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4Zm9 4-2-.6a7 7 0 0 0-.4-1l1.3-1.7-2-2-1.7 1.3a7 7 0 0 0-1-.4L14 3h-4l-.6 2.2a7 7 0 0 0-1 .4L6.7 4.3l-2 2 1.3 1.7a7 7 0 0 0-.4 1L3 12l2.2.6a7 7 0 0 0 .4 1L4.3 15.3l2 2 1.7-1.3a7 7 0 0 0 1 .4L10 21h4l.6-2.2a7 7 0 0 0 1-.4l1.7 1.3 2-2-1.3-1.7a7 7 0 0 0 .4-1Z'
            : 'M7 7h10v10H7Zm3 12h4'
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function page(path: string) {
  if (path.startsWith('/app/plan')) return <PlanPage />
  if (path.startsWith('/app/sharing')) return <FileList trash={false} />
  if (path.startsWith('/app/settings')) return <SettingsPage />
  if (path.startsWith('/app/deleted')) return <FileList trash />
  return <AccountPage />
}

function AccountPage() {
  const [me, setMe] = useState<Me | null>(null)
  useEffect(() => {
    fetch(`${apiOrigin()}/v1/me`, { headers: headers() })
      .then((res) => (res.ok ? (res.json() as Promise<Me>) : null))
      .then((row) => {
        if (row) setMe(row)
      })
      .catch(() => undefined)
  }, [])
  return (
    <>
      <article className="card profile">
        <span className="avatar lg">L</span>
        <div className="row-text">
          <span className="t">you</span>
          <span className="s">{me?.email ?? 'hello@loft.app'}</span>
        </div>
      </article>
      <article className="card">
        <div className="card-title">
          <h2>storage</h2>
        </div>
        <p className="big-num">
          {me ? formatSize(me.bytes) : '1.2 TB'} <small>in the cloud</small>
        </p>
        <div className="meter lg">
          <i style={{ width: '12%' }} />
        </div>
        <p className="kv">
          <span>this Mac</span>
          <span>Zero KB</span>
        </p>
      </article>
      <p className="banner">
        this loft is free. run the api, then get loft on your mac.
        <a className="pill pill-dark" href="/app/plan">
          plan
        </a>
      </p>
    </>
  )
}

function PlanPage() {
  return (
    <article className="card">
      <div className="card-title">
        <h2>self-hosted. free.</h2>
      </div>
      <p className="plan-price">
        <span className="big-num">$0</span>
        <span className="muted">you run the storage api</span>
      </p>
      <p className="faint">S3 optional · disk backend by default</p>
    </article>
  )
}

function SettingsPage() {
  return (
    <article className="card">
      <div className="card-title">
        <h2>Finder</h2>
      </div>
      <p className="muted">Loft sits in Locations, next to Macintosh HD.</p>
      <div className="row">
        <div className="row-text">
          <span className="t">keep new folders on this Mac</span>
          <span className="s">off until you choose a folder in Finder</span>
        </div>
        <button
          type="button"
          className="toggle"
          role="switch"
          aria-checked="false"
        />
      </div>
    </article>
  )
}

function FileList({ trash }: { trash: boolean }) {
  const [files, setFiles] = useState<Remote[] | null>(null)
  useEffect(() => {
    const q = trash ? '?trash=1' : ''
    fetch(`${apiOrigin()}/v1/files${q}`, { headers: headers() })
      .then((res) =>
        res.ok ? (res.json() as Promise<{ files: Remote[] }>) : null,
      )
      .then((body) => setFiles(body?.files ?? []))
      .catch(() => setFiles([]))
  }, [trash])
  if (!files?.length) {
    return (
      <article className="card empty">
        <h3>{trash ? 'nothing in deleted' : 'no shared links yet'}</h3>
        <p>
          {trash
            ? 'files you delete stay for 30 days, then they’re gone.'
            : 'right-click a file in Finder and copy a loft link.'}
        </p>
      </article>
    )
  }
  return (
    <article className="card">
      {files.map((file) => (
        <p className="kv" key={file.id}>
          <span>{file.name}</span>
          <span>{file.folder}</span>
        </p>
      ))}
    </article>
  )
}
