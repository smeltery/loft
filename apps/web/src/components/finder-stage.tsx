import { files } from '../copy'

const selected = files[0]

export default function FinderStage() {
  if (!selected) return null
  return (
    <div className="window" aria-hidden="true">
      <div className="traffic">
        <i />
        <i />
        <i />
        <span>Finder</span>
      </div>
      <div className="finder">
        <aside>
          <p>Favorites</p>
          <ul>
            <li>AirDrop</li>
            <li>Recents</li>
            <li>Applications</li>
            <li>Desktop</li>
            <li>Documents</li>
            <li>Downloads</li>
          </ul>
          <p>Locations</p>
          <ul>
            <li>Macintosh HD</li>
            <li className="on">Loft</li>
          </ul>
        </aside>
        <ul className="list">
          {files.map((file) => (
            <li
              key={file.name}
              className={file.name === selected.name ? 'on' : undefined}
            >
              <b>{file.name}</b>
              <span>{file.size}</span>
            </li>
          ))}
        </ul>
        <dl className="info">
          <dt>Kind</dt>
          <dd>{selected.kind}</dd>
          <dt>Size</dt>
          <dd>48,213,574,021 bytes (Zero bytes on disk)</dd>
          <dt>Where</dt>
          <dd>Loft › Client Work</dd>
          <dt>Created</dt>
          <dd>Yesterday, 9:42 AM</dd>
          <dt>Modified</dt>
          <dd>Today, 10:24 AM</dd>
        </dl>
      </div>
    </div>
  )
}
