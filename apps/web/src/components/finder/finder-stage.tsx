import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { files } from '../../copy'
import { Logo } from '../../logo'
import './finder.css'
import './finder-info.css'
import { DocIcon, FolderIcon, Glyph } from './finder-icons'
import { Orbit } from '../orbit'
import { Still, type StillKind } from '../stills'

const favs: [
  string,
  'airdrop' | 'recents' | 'apps' | 'desktop' | 'docs' | 'downloads',
][] = [
  ['AirDrop', 'airdrop'],
  ['Recents', 'recents'],
  ['Applications', 'apps'],
  ['Desktop', 'desktop'],
  ['Documents', 'docs'],
  ['Downloads', 'downloads'],
]
const folders = ['Brand', 'Clients', 'Music', 'Archive']
const stills: Record<string, StillKind> = {
  'wedding-film_final.mov': 'wedding',
  'drone-coast_4k.mp4': 'drone',
  'Brand Shoot.jpg': 'brand',
  'interview-broll.mov': 'interview',
}
const REST = { x: 0.55, y: 0.8 }

export default function FinderStage({ step = 0 }: { step?: number }) {
  const scene = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState(REST)
  useEffect(() => {
    const root = scene.current
    if (!root) return
    const place = () => {
      const target =
        step === 1
          ? root.querySelector('.f-item.target .f-icon')
          : step === 2
            ? root.querySelector('.f-menu-get-info')
            : step === 3
              ? root.querySelector('.f-info mark')
              : null
      if (!(target instanceof HTMLElement)) {
        setCursor(REST)
        return
      }
      const box = root.getBoundingClientRect()
      const hit = target.getBoundingClientRect()
      setCursor({
        x: (hit.left + 0.6 * hit.width - box.left) / box.width,
        y: (hit.top + 0.55 * hit.height - box.top) / box.height,
      })
    }
    const delay = window.setTimeout(place, step >= 2 ? 400 : 0)
    addEventListener('resize', place)
    return () => {
      clearTimeout(delay)
      removeEventListener('resize', place)
    }
  }, [step])
  const sceneStyle = {
    '--cx': cursor.x,
    '--cy': cursor.y,
  } as CSSProperties
  return (
    <div className="stage" aria-hidden="true">
      <Orbit />
      <div className="frame">
        <div
          ref={scene}
          className="f-scene"
          style={sceneStyle}
          role="img"
          aria-label="Finder showing the Loft drive. Get Info says a 48.2 GB film uses zero bytes on disk."
        >
          <div className="f-window">
            <aside className="f-side">
              <span className="f-lights f-lights-finder">
                <i />
                <i />
                <i />
              </span>
              <p className="f-side-head">Favorites</p>
              {favs.map(([name, icon]) => (
                <p key={name} className="f-side-item">
                  <Glyph name={icon} />
                  {name}
                </p>
              ))}
              <p className="f-side-head">Locations</p>
              <p className="f-side-item">
                <Glyph name="disk" />
                Macintosh HD
              </p>
              <p className="f-side-item active">
                <span className="f-side-logo">
                  <Logo className="logo-sm" />
                </span>
                Loft
                <Glyph name="eject" className="f-glyph f-eject" />
              </p>
            </aside>
            <div className="f-main">
              <div className="f-toolbar">
                <span className="f-capsule">
                  <Glyph name="back" />
                  <Glyph name="forward" className="f-glyph dim" />
                </span>
                <b className="f-title">Client Work</b>
                <span className="f-capsule f-push">
                  <Glyph name="grid" />
                  <Glyph name="list" className="f-glyph dim" />
                </span>
                <span className="f-capsule">
                  <Glyph name="share" />
                  <Glyph name="tag" />
                  <Glyph name="more" />
                </span>
                <span className="f-capsule round">
                  <Glyph name="search" />
                </span>
              </div>
              <div className="f-grid">
                {folders.map((name) => (
                  <div key={name} className="f-item">
                    <div className="f-icon folder">
                      <FolderIcon />
                    </div>
                    <span className="f-name">{name}</span>
                  </div>
                ))}
                {files.map((file) => {
                  const still = stills[file.name]
                  const target = file.name.startsWith('wedding')
                  return (
                    <div
                      key={file.name}
                      className={target ? 'f-item target' : 'f-item'}
                    >
                      <div
                        className={still ? 'f-icon thumb wide' : 'f-icon doc'}
                      >
                        {still ? (
                          <Still kind={still} />
                        ) : (
                          <DocIcon label={ext(file.name)} />
                        )}
                      </div>
                      <span className="f-name">{file.name}</span>
                      <span className="f-size">{file.size}</span>
                    </div>
                  )
                })}
              </div>
              <div className="f-path">
                <Logo className="logo-sm" /> Loft <span>›</span>{' '}
                <FolderIcon className="f-folder path" /> Client Work
              </div>
            </div>
          </div>
          <div className="f-menu">
            <p>Open</p>
            <p>
              Open With <span>›</span>
            </p>
            <i />
            <p>Move to Trash</p>
            <i />
            <p className="f-menu-get-info">Get Info</p>
            <p>Rename</p>
            <p>Compress “wedding-film_final.mov”</p>
            <p>Duplicate</p>
            <p>Make Alias</p>
            <p>Quick Look</p>
            <i />
            <p>Copy</p>
            <p>Share…</p>
            <i />
            <div className="f-menu-tags">
              <b />
              <b />
              <b />
              <b />
              <b />
              <b />
              <b />
            </div>
            <p>Tags…</p>
          </div>
          <div className="f-info">
            <div className="f-info-bar">
              <span className="f-lights">
                <i />
                <i />
                <i />
              </span>
              <Still kind="wedding" />
              <b>wedding-film_final.mov Info</b>
            </div>
            <div className="f-info-head">
              <Still kind="wedding" />
              <div>
                <b>wedding-film_final.mov</b>
                <span>Modified: Today, 10:24 AM</span>
              </div>
              <b className="f-info-size">48.2 GB</b>
            </div>
            <p className="f-info-tags">Add Tags…</p>
            <p className="f-info-section open">
              <span>›</span> General:
            </p>
            <dl>
              <dt>Kind:</dt>
              <dd>QuickTime movie</dd>
              <dt>Size:</dt>
              <dd>
                48,213,574,021 bytes (<mark>Zero bytes</mark> on disk)
              </dd>
              <dt>Where:</dt>
              <dd>Loft › Client Work</dd>
              <dt>Created:</dt>
              <dd>Yesterday, 9:42 AM</dd>
              <dt>Modified:</dt>
              <dd>Today, 10:24 AM</dd>
            </dl>
            <div className="f-info-checks">
              <span>
                <i /> Stationery pad
              </span>
              <span>
                <i /> Locked
              </span>
            </div>
            <p className="f-info-section">
              <span>›</span> More Info:
            </p>
            <p className="f-info-section">
              <span>›</span> Name &amp; Extension:
            </p>
            <p className="f-info-section">
              <span>›</span> Comments:
            </p>
            <p className="f-info-section">
              <span>›</span> Open with:
            </p>
          </div>
          <svg className="f-cursor" viewBox="0 0 20 24" aria-hidden="true">
            <path
              d="M2 1.5v18l4.6-4.4 3 6.6 3-1.3-3-6.5h6.3z"
              fill="#000"
              stroke="#fff"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

function ext(name: string) {
  return name.split('.').pop()?.toUpperCase() ?? ''
}
