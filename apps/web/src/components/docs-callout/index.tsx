import './styles.css'

const guides = [
  {
    href: '/docs/quick-start',
    title: 'start your first drive',
    description: 'run the API and upload your first file.',
  },
  {
    href: '/docs/guides/storage',
    title: 'choose your storage',
    description: 'use a local disk or your own S3 bucket.',
  },
  {
    href: '/docs/guides/macos',
    title: 'connect your mac',
    description: 'bring your files into Finder.',
  },
]

export default function DocsCallout() {
  return (
    <section
      className="section wrap docs-callout"
      aria-labelledby="docs-heading"
    >
      <div className="docs-callout-card">
        <div className="docs-callout-intro">
          <p className="docs-callout-label">the loft docs</p>
          <h2 id="docs-heading">
            your own drive.
            <br />
            <em>start here.</em>
          </h2>
          <p className="docs-callout-description">
            from your first upload to a drive in Finder. follow the guides to
            run loft on your own terms.
          </p>
          <a className="pill pill-dark" href="/docs">
            explore the docs <span aria-hidden="true">→</span>
          </a>
          <p className="docs-callout-note">
            self-hosted. no loft account needed.
          </p>
        </div>
        <ol className="docs-callout-guides" aria-label="Setup guides">
          {guides.map((guide, index) => (
            <li key={guide.href}>
              <a href={guide.href}>
                <span className="docs-callout-number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="docs-callout-guide">
                  <strong>{guide.title}</strong>
                  <span>{guide.description}</span>
                </span>
                <span className="docs-callout-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
