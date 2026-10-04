import { AppleLogo } from './components/apple-logo'
import Compare from './components/compare'
import Faq from './components/faq'
import Hero from './components/hero'
import How from './components/how'
import Pain from './components/pain'
import Pricing from './components/pricing'
import Stories from './components/features/stories'
import Story from './components/story'
import TopBar from './components/top-bar'
import { site } from './copy'
import { Logo } from './logo'
import { RequestPage } from './request-page'
import './promo.css'
import { requestToken } from './request-token'
import { SharePage } from './share-page'
import { shareId } from './share-id'
import { AppShell } from './app-shell'
import { appPath } from './app-route'
import { legalPath, LegalPage } from './legal'

export default function App() {
  const token = requestToken()
  if (token) return <RequestPage token={token} />
  const shared = shareId()
  if (shared) return <SharePage id={shared} />
  const legal = legalPath()
  if (legal) return <LegalPage kind={legal} />
  const shell = appPath()
  if (shell) return <AppShell path={shell} />
  return (
    <>
      <TopBar />
      <main className="marketing">
        <Hero />
        <Story />
        <How />
        <Stories />
        <Pain />
        <Compare />
        <Pricing />
        <Faq />
        <section className="ending wrap" id="download">
          <h2>
            stop deleting files
            <br />
            to make <em>space</em>.
          </h2>
          <p className="body">get terabytes of space in finder, today.</p>
          <a className="pill pill-dark" href={site.downloadHref}>
            <AppleLogo />
            download for mac
          </a>
        </section>
      </main>
      <footer className="foot">
        <p>
          <a href="/privacy">privacy</a>
          <span aria-hidden="true">·</span>
          <a href="/terms">terms</a>
          <span aria-hidden="true">·</span>© 2026 {site.name}
        </p>
        <div className="orbit-mark" aria-hidden="true">
          <Logo className="logo" />
        </div>
      </footer>
    </>
  )
}
