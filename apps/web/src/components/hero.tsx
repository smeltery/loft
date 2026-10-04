import { site } from '../copy'
import { Logo } from '../logo'
import { AppleLogo } from './apple-logo'
import { Confetti } from './confetti'
import { Face } from './stills'

export default function Hero() {
  return (
    <section className="hero wrap" id="top">
      <Confetti />
      <h1 className="hero-title">
        <span className="hero-meet">meet</span>
        <span className="hero-tile" aria-hidden="true">
          <Logo />
        </span>
        <span>
          <em>{site.name}</em>.
        </span>
      </h1>
      <p className="lede">
        <strong>more space</strong> for your mac, <mark>without</mark> buying a
        new one.
      </p>
      <a className="pill pill-dark" href={site.downloadHref}>
        <AppleLogo />
        download for mac
      </a>
      <p className="fine">free to download · needs macos 26</p>
      <div className="lt-pair">
        <p className="lifetime">
          <span className="lt-stack" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <i key={i} style={{ zIndex: 5 - i }}>
                <Face i={i} />
              </i>
            ))}
          </span>
          <span>
            <b>free forever</b> · no credit card
          </span>
        </p>
        <a className="lifetime lt-offer" href="#pricing">
          <span>
            <mark className="marker">self-host</mark> on your own cloud · open
            source
          </span>
        </a>
      </div>
    </section>
  )
}
