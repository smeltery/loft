import { DocIcon } from './DocIcon'
import { findPage } from './pages'

export function DocCards({
  links,
}: {
  links: { label: string; href: string }[]
}) {
  const icons: Record<string, string> = {
    'quick-start': 'terminal',
    'upload-file': 'shell',
    deployment: 'server',
    storage: 'server',
    macos: 'folder',
    sharing: 'folder',
    'download-range': 'shell',
    'request-files': 'folder',
  }
  return (
    <div className="doc-card-grid">
      {links.map((link) => {
        const target = findPage(link.href)
        const icon = icons[link.href.split('/').at(-1) ?? ''] ?? 'terminal'
        return (
          <a className="doc-card" key={link.href} href={link.href}>
            <DocIcon name={icon} />
            <strong>{link.label}</strong>
            <p>{target?.description}</p>
            <span className="doc-card-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        )
      })}
    </div>
  )
}
