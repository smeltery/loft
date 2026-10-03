import { site } from '../copy'

export default function TopBar() {
  return (
    <header className="top">
      <a className="mark" href="#top">
        {site.name}
      </a>
      <nav>
        <a href="#how">how</a>
        <a href="#why">why</a>
        <a href="#plan">plan</a>
        <a href="#faq">faq</a>
      </nav>
      <a className="btn btn-sm" href={site.downloadHref}>
        {site.download}
      </a>
    </header>
  )
}
