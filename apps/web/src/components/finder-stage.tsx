import { files } from '../copy'
import { Logo } from '../logo'
import './finder.css'

const favs = [
  'AirDrop',
  'Recents',
  'Applications',
  'Desktop',
  'Documents',
  'Downloads',
]
const folders = ['Brand', 'Clients', 'Music', 'Archive']

export default function FinderStage() {
  return (
    <div className="stage" aria-hidden="true">
      <div className="f-window">
        <aside className="f-side">
          <span className="f-lights">
            <i />
            <i />
            <i />
          </span>
          <p className="f-side-head">Favorites</p>
          {favs.map((name) => (
            <p key={name} className="f-side-item">
              <i className="f-dot" />
              {name}
            </p>
          ))}
          <p className="f-side-head">Locations</p>
          <p className="f-side-item">
            <i className="f-dot" />
            Macintosh HD
          </p>
          <p className="f-side-item on">
            <Logo className="logo-sm" /> Loft
          </p>
        </aside>
        <div className="f-main">
          <div className="f-toolbar">
            <span className="f-nav" />
            <span className="f-nav" />
            <b>Client Work</b>
            <span className="f-tool" />
            <span className="f-tool" />
            <span className="f-tool" />
          </div>
          <div className="f-grid">
            {folders.map((name) => (
              <div key={name} className="f-item">
                <i className="f-tile folder" />
                <span className="f-name">{name}</span>
              </div>
            ))}
            {files.map((file) => (
              <div key={file.name} className="f-item">
                <i className="f-tile">{ext(file.name)}</i>
                <span className="f-name">{file.name}</span>
                <span className="f-size">{file.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ext(name: string) {
  return name.split('.').pop()?.toUpperCase() ?? ''
}
