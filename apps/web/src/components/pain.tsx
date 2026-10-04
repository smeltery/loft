import { site } from '../copy'
import { Logo } from '../logo'
import { AppleLogo } from './apple-logo'
import { ServiceMark } from './service-mark'
import './pain.css'
import './pain-mobile.css'

export default function Pain() {
  return (
    <section id="why" className="section wrap centered pains-wrap">
      <h2>
        sound <em>familiar</em>?
      </h2>
      <p className="body">if you have big files, you’ve seen these.</p>
      <div
        className="macbook"
        role="img"
        aria-label="A MacBook showing: your disk is almost full; downloading a video, about 58 minutes; delete Goa trip 2024?"
      >
        <div className="mb-lid">
          <span className="mb-notch" aria-hidden="true" />
          <div className="mb-screen">
            <div className="mb-menubar">
              <svg viewBox="0 0 14 17" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M11.6 9c0-2 1.7-3 1.8-3.1-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.7-2.8-.7C3 4.4 1.6 5.3.9 6.6c-1.5 2.6-.4 6.4 1 8.5.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3 0 0-2-.8-2.1-3.1zM9.6 3c.6-.7 1-1.7.9-2.6-.8 0-1.8.5-2.4 1.2-.5.6-1 1.6-.9 2.5.9.1 1.8-.4 2.4-1.1z"
                />
              </svg>
              <b>Finder</b>
              <span>File</span>
              <span>Edit</span>
              <span>View</span>
              <span className="mb-clock">Thu 6:42 PM</span>
            </div>
            <div className="scr-notif">
              <span className="scr-notif-app" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <path d="M7 14h.01" />
                </svg>
              </span>
              <span>
                <b>Your disk is almost full</b>
                <span>Save space by optimizing storage.</span>
              </span>
              <small>now</small>
            </div>
            <div className="scr-prog">
              <p>
                <span className="scr-thumb">
                  <img src="/thumbs/wedding.webp" alt="" loading="lazy" />
                </span>
                <b>Downloading “wedding-film.mov”</b>
              </p>
              <span className="scr-prog-bar">
                <i />
              </span>
              <small>3.2 GB of 48.2 GB · About 58 minutes</small>
            </div>
            <div className="scr-alert">
              <span className="scr-alert-icon" aria-hidden="true" />
              <b>Delete “Goa trip 2024”?</b>
              <span>
                This item will be deleted immediately. You can’t undo this
                action.
              </span>
              <span className="scr-alert-btns">
                <i>Cancel</i>
                <i className="del">Delete</i>
              </span>
            </div>
          </div>
        </div>
        <div className="mb-base" aria-hidden="true" />
      </div>
      <div className="pain-causes">
        <p className="pain-causes-head">why it happens</p>
        <p className="pain-cause">
          <BrandIcons n={3} />
          they keep copies on your mac.
        </p>
        <p className="pain-cause">
          <BrandIcons n={2} />
          they download the whole file first.
        </p>
        <p className="pain-cause">
          <BrandIcons n={3} />
          so you end up deleting memories.
        </p>
      </div>
      <div className="pains-fix">
        <Logo width={30} height={22} />
        <p>
          <b>with loft, never again.</b>
          <span>files open in 0.8 s and take 0 bytes on your mac.</span>
        </p>
        <a className="pill pains-fix-go" href={site.downloadHref}>
          <AppleLogo />
          download for mac
        </a>
      </div>
    </section>
  )
}

function BrandIcons({ n }: { n: 2 | 3 }) {
  return (
    <span className="pain-logos" aria-hidden="true">
      <ServiceMark name="icloud" size={16} />
      <ServiceMark name="dropbox" size={16} />
      {n === 3 ? <ServiceMark name="google drive" size={16} /> : null}
    </span>
  )
}
