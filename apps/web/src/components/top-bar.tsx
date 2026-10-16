export default function TopBar() {
  return (
    <nav className="nav" aria-label="Main">
      <a href="#top" className="nav-home on" aria-current="location">
        loft
      </a>
      <a href="#how">how it works</a>
      <a href="#pricing">plan</a>
      <a href="#faq">faq</a>
      <a href="/docs">docs</a>
    </nav>
  )
}
