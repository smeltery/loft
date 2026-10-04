type Name =
  | 'airdrop'
  | 'recents'
  | 'apps'
  | 'desktop'
  | 'docs'
  | 'downloads'
  | 'disk'
  | 'eject'
  | 'back'
  | 'forward'
  | 'grid'
  | 'list'
  | 'share'
  | 'tag'
  | 'more'
  | 'search'

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function Glyph({
  name,
  className = 'f-glyph',
}: {
  name: Name
  className?: string
}) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {mark(name)}
    </svg>
  )
}

export function FolderIcon({ className = 'f-folder' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 52" aria-hidden="true">
      <path
        d="M4 6a3 3 0 0 1 3-3h15l5 5h30a3 3 0 0 1 3 3v6H4z"
        fill="#aeaeb2"
      />
      <rect x="2" y="12" width="60" height="38" rx="4" fill="#c7c7cc" />
    </svg>
  )
}

export function DocIcon({ label }: { label: string }) {
  return (
    <svg className="f-doc" viewBox="0 0 48 60" aria-hidden="true">
      <path
        d="M6 2h26l12 12v42a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
        fill="#fff"
        stroke="#d6d6da"
        strokeWidth="1.2"
      />
      <path
        d="M32 2v10a2 2 0 0 0 2 2h10"
        fill="#f1f1f3"
        stroke="#d6d6da"
        strokeWidth="1.2"
      />
      <path
        d="M13 22h22M13 27h22M13 32h16"
        stroke="#c8c8cd"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text
        x="24"
        y="50"
        textAnchor="middle"
        fontSize="7"
        fontWeight="600"
        fill="#9a9aa0"
        fontFamily="-apple-system, sans-serif"
      >
        {label}
      </text>
    </svg>
  )
}

function mark(name: Name) {
  if (name === 'airdrop') {
    return (
      <>
        <circle cx="12" cy="11" r="2" {...stroke} />
        <path
          d="M4 17C2.7 15.3 2 13.3 2 11a10 10 0 1 1 20 0c0 2.3-.7 4.3-2 6"
          {...stroke}
        />
        <path d="M7.5 15A6 6 0 1 1 16.5 15" {...stroke} />
      </>
    )
  }
  if (name === 'recents') {
    return (
      <>
        <circle cx="12" cy="12" r="9" {...stroke} />
        <path d="M12 7v5l3 2" {...stroke} />
      </>
    )
  }
  if (name === 'apps') {
    return (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1.2" fill="currentColor" />
        <rect x="14" y="4" width="6" height="6" rx="1.2" fill="currentColor" />
        <rect x="4" y="14" width="6" height="6" rx="1.2" fill="currentColor" />
        <rect x="14" y="14" width="6" height="6" rx="1.2" fill="currentColor" />
      </>
    )
  }
  if (name === 'desktop') {
    return (
      <>
        <rect x="3" y="5" width="18" height="12" rx="1.6" {...stroke} />
        <path d="M8 21h8M12 17v4" {...stroke} />
      </>
    )
  }
  if (name === 'docs') return <path d="M7 3h7l5 5v13H7zM14 3v5h5" {...stroke} />
  if (name === 'downloads') {
    return <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" {...stroke} />
  }
  if (name === 'disk') {
    return (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" {...stroke} />
        <circle cx="16" cy="12" r="1.6" fill="currentColor" />
      </>
    )
  }
  if (name === 'eject')
    return <path d="M5 16h14M6.5 13 12 6l5.5 7z" {...stroke} />
  if (name === 'back') return <path d="M14 6 8 12l6 6" {...stroke} />
  if (name === 'forward') return <path d="M10 6l6 6-6 6" {...stroke} />
  if (name === 'grid') {
    return (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="14" y="4" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="4" y="14" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="14" y="14" width="6" height="6" rx="1" fill="currentColor" />
      </>
    )
  }
  if (name === 'list') {
    return (
      <path d="M8 7h12M8 12h12M8 17h12M4 7v.01M4 12v.01M4 17v.01" {...stroke} />
    )
  }
  if (name === 'share') {
    return (
      <>
        <path d="M12 14V4m0 0-4 4m4-4 4 4" {...stroke} />
        <path d="M5 14v5h14v-5" {...stroke} />
      </>
    )
  }
  if (name === 'tag')
    return <path d="M3 12 12 3h7v7l-9 9zM16 7.5h.01" {...stroke} />
  if (name === 'search') {
    return (
      <>
        <circle cx="11" cy="11" r="7" {...stroke} />
        <path d="M17 17l4 4" {...stroke} />
      </>
    )
  }
  return (
    <>
      <circle cx="6" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="18" cy="12" r="1.4" fill="currentColor" />
    </>
  )
}
