import { useEffect } from 'react'
import { DocActions } from './actions/DocActions'
import { BrandIcon } from './BrandIcon'
import { DocArticle } from './DocArticle'
import { DocsNavigation } from './DocsNavigation'
import { MobileNavigation } from './MobileNavigation'
import { findPage } from './pages'
import { DocsSearch } from './search/DocsSearch'
import './rendering/base.css'
import './docs.css'
import './docs-content.css'
import './docs-mobile.css'
import './actions/doc-actions.css'

export function DocsPage() {
  const page = findPage(window.location.pathname)
  useEffect(() => {
    // The docs render after the entry bundle loads, so resolve deep links now.
    const target = window.location.hash.slice(1)
    if (target)
      document.getElementById(target)?.scrollIntoView({ behavior: 'instant' })
  }, [])
  const toc =
    page?.sections.map((section) => ({
      href: `#${section.id}`,
      title: section.title,
    })) ?? []
  return (
    <div className="docs-page">
      <header className="docs-header">
        <a className="skip-link" href="#docs-main">
          Skip to content
        </a>
        <MobileNavigation />
        <a className="brand" href="/" aria-label="loft home">
          <img
            className="brand-mark"
            src="/brand/logo.svg"
            width="25"
            height="25"
            alt=""
          />
          loft.
        </a>
        <span className="docs-header-label">Documentation</span>
        <nav aria-label="Documentation">
          <a href="/docs/api">API reference</a>
          <a href="/docs/examples">Examples</a>
          <a className="brand-heading" href="https://github.com/smeltery/loft">
            <BrandIcon name="GitHub" size={16} />
            GitHub ↗
          </a>
        </nav>
        <DocsSearch />
      </header>
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <DocsNavigation />
        </aside>
        <main className="docs-main" id="docs-main">
          {page ? (
            <>
              <details className="mobile-toc">
                <summary>On this page</summary>
                <nav aria-label="On this page">
                  {toc.map((item) => (
                    <a key={item.href} href={item.href}>
                      {item.title}
                    </a>
                  ))}
                </nav>
              </details>
              <DocArticle page={page} />
              <div className="mobile-doc-actions">
                <DocActions page={page} />
              </div>
            </>
          ) : (
            <section>
              <h1>Page not found</h1>
              <p>
                This documentation page does not exist. Search the docs or
                return to the overview.
              </p>
              <a className="text-link" href="/docs">
                Back to documentation →
              </a>
            </section>
          )}
          <footer className="docs-footer">
            <a href="/">← loft home</a>
            <a href="https://github.com/smeltery/loft/tree/main/apps/web/src/docs/content">
              View documentation source ↗
            </a>
          </footer>
        </main>
        <aside className="docs-toc">
          <p>ON THIS PAGE</p>
          {toc.map((item) => (
            <a key={item.href} href={item.href}>
              {item.title}
            </a>
          ))}
          {page && <DocActions page={page} />}
        </aside>
      </div>
    </div>
  )
}
