import { site } from '../copy'
import { AppleLogo } from './apple-logo'
import './pricing.css'

export default function Pricing() {
  return (
    <section className="section wrap centered" id="pricing">
      <h2>
        free. <em>any size</em>.
      </h2>
      <p className="body">run loft yourself. store files on your own cloud.</p>
      <div className="price-card">
        <div className="price-top">
          <span>loft</span>
          <span className="price-badge">free forever</span>
        </div>
        <p className="price-value">
          <strong>$0</strong>
          <span>/ month</span>
        </p>
        <p className="price-caption">
          all the space you need. all the features included.
        </p>
        <ul className="price-features">
          <li>your files, in your own cloud</li>
          <li>open big files instantly in finder</li>
          <li>share links and request files from anyone</li>
          <li>keep folders on your mac for offline access</li>
          <li>free and open source</li>
        </ul>
        <a className="pill pill-dark price-go" href={site.downloadHref}>
          <AppleLogo />
          download for mac
        </a>
        <p className="price-note">
          self-host loft. only pay your cloud provider for the storage you use.
        </p>
      </div>
    </section>
  )
}
