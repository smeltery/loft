import Compare from './components/compare'
import Faq from './components/faq'
import Hero from './components/hero'
import How from './components/how'
import Pain from './components/pain'
import Pricing from './components/pricing'
import Stories from './components/stories'
import TopBar from './components/top-bar'
import { site } from './copy'
import { RequestPage } from './request-page'
import { requestToken } from './request-token'

export default function App() {
  const token = requestToken()
  if (token) return <RequestPage token={token} />
  return (
    <>
      <TopBar />
      <main>
        <Hero />
        <How />
        <Stories />
        <Pain />
        <Compare />
        <Pricing />
        <Faq />
        <section className="cta wrap" id="download">
          <h2>stop deleting files to make space.</h2>
          <p>get terabytes of space in finder, today.</p>
          <a className="btn" href={site.downloadHref}>
            {site.download}
          </a>
        </section>
      </main>
      <footer className="site-foot wrap">
        <span>{site.name}</span>
        <span>{site.tagline}</span>
      </footer>
    </>
  )
}
