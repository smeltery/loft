import { useState } from 'react'
import { AccountPage } from './account/overview'
import { DeletedPage } from './account/deleted'
import { SettingsPage } from './account/settings'
import { savedToken } from './account/api'
import { Logo } from './logo'
import { site } from './copy'
import { SharingPage } from './account/sharing'
import './app.css'

const tabs: { href: string; label: string; sep?: boolean }[] = [
  { href: '/app', label: 'account' },
  { href: '/app/plan', label: 'plan' },
  { href: '/app/sharing', label: 'shared' },
  { href: '/app/settings', label: 'settings' },
  { href: '/app/deleted', label: 'deleted', sep: true },
]

export function AppShell({ path }: { path: string }) {
  const [token, setToken] = useState(savedToken)
  return (
    <div className="app-body">
      <header className="a-top">
        <a className="brand" href="/app" aria-label={`${site.name} home`}>
          <Logo />
          <span>{site.name}</span>
        </a>
      </header>
      <main className="a-main">
        <header className="account-page-head">
          <h1 className="account-heading">
            {path.startsWith('/app/deleted')
              ? 'recently deleted'
              : path.startsWith('/app/sharing')
                ? 'sharing'
                : (tabs.find((tab) => tab.href === path)?.label ?? 'account')}
          </h1>
          {path.startsWith('/app/sharing') && (
            <p className="faint">
              links to your files, and requests for uploads to your folders.
            </p>
          )}
        </header>
        {page(path, token, setToken)}
      </main>
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

function DockIcon({ name }: { name: string }) {
  const d =
    name === 'account'
      ? 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM5.5 19c2-4 11-4 13 0'
      : name === 'plan'
        ? 'm3 7 9-5 9 5-9 5-9-5Zm0 5 9 5 9-5M3 17l9 5 9-5'
        : name === 'shared'
          ? 'm10 13 4-4M8 15l-2 2a4 4 0 0 0 6 5l4-4a4 4 0 0 0-5-6M16 9l2-2a4 4 0 0 0-6-5L8 6a4 4 0 0 0 5 6'
          : name === 'settings'
            ? 'M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4Zm9 4-2-.6a7 7 0 0 0-.4-1l1.3-1.7-2-2-1.7 1.3a7 7 0 0 0-1-.4L14 3h-4l-.6 2.2a7 7 0 0 0-1 .4L6.7 4.3l-2 2 1.3 1.7a7 7 0 0 0-.4 1L3 12l2.2.6a7 7 0 0 0 .4 1L4.3 15.3l2 2 1.7-1.3a7 7 0 0 0 1 .4L10 21h4l.6-2.2a7 7 0 0 0 1-.4l1.7 1.3 2-2-1.3-1.7a7 7 0 0 0 .4-1Z'
            : 'M3 5h18M9 5V2h6v3M5 5l1 15a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-15M9 9v8M15 9v8'
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

function page(path: string, token: string, setToken: (token: string) => void) {
  if (path.startsWith('/app/plan')) return <PlanPage />
  if (path.startsWith('/app/sharing'))
    return <SharingPage key={token} token={token} />
  if (path.startsWith('/app/settings'))
    return <SettingsPage token={token} onSave={setToken} />
  if (path.startsWith('/app/deleted'))
    return <DeletedPage key={token} token={token} />
  return <AccountPage key={token} token={token} />
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
