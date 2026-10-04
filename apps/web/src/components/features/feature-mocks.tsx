import { chromeCopy } from '@loft/core'
import './feature-windows.css'
import './feature-scenes.css'
import type { ReactNode } from 'react'
import { Logo } from '../../logo'
import { AppleLogo } from '../apple-logo'
import { FolderIcon, Glyph } from '../finder/finder-icons'

function Lights() {
  return (
    <span className="f-lights">
      <i />
      <i />
      <i />
    </span>
  )
}

function MenuScene({ children }: { children: ReactNode }) {
  return (
    <div className="mb">
      <div className="mb-bar">
        <AppleLogo />
        <b>Finder</b>
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span className="mb-right">
          <Logo width={16} height={12} />
          Thu 6:42 PM
        </span>
      </div>
      {children}
    </div>
  )
}

function Window({
  title,
  children,
  storage = false,
}: {
  title: string
  children: ReactNode
  storage?: boolean
}) {
  const items = storage
    ? ['Wi-Fi', 'Bluetooth', 'Network', 'General', 'Appearance']
    : ['Recents', 'Desktop', 'Downloads', 'Macintosh HD', 'Loft']
  return (
    <div className="win w-split">
      <aside className="w-side">
        <Lights />
        <p className="w-side-head">{storage ? 'Search' : 'Favorites'}</p>
        {items.map((item, i) => (
          <p
            className={`w-side-item${i === (storage ? 3 : 4) ? ' on' : ''}`}
            key={item}
          >
            <Glyph name={storage ? 'apps' : 'disk'} />
            {item}
          </p>
        ))}
      </aside>
      <div className="w-main">
        <div className="w-toolbar">
          <Lights />
          <Glyph name="back" />
          <Glyph name="forward" />
          <b>{title}</b>
        </div>
        {children}
      </div>
    </div>
  )
}

export function FeatureMock({ index }: { index: number }) {
  if (index === 0)
    return (
      <MenuScene>
        <div className="mb-panel">
          <div className="dp-spot">
            <Logo width={30} height={22} />
            <b>{chromeCopy.drop.release}</b>
            <small>{chromeCopy.drop.item}</small>
          </div>
          <p className="dp-head">{chromeCopy.drop.intoFolder}</p>
          <p className="mb-row">
            <FolderIcon />
            Client Work
          </p>
          <p className="mb-row">
            <FolderIcon />
            Films
          </p>
        </div>
        <div className="dp-drag">
          <img src="/thumbs/wedding.webp" alt="" loading="lazy" />
          <span>wedding-film_final.mov</span>
        </div>
      </MenuScene>
    )
  if (index === 1)
    return (
      <Window title="Storage" storage>
        <div className="ss-group">
          <p className="ss-row">
            <b>Macintosh HD</b>
            <span>214.6 of 245.1 GB</span>
          </p>
          <div className="ss-bar">
            <i />
            <i />
            <i />
          </div>
          <p className="ss-legend">
            <span>Applications</span>
            <span>Documents</span>
            <span>System</span>
          </p>
        </div>
        <div className="ss-group">
          <p className="ss-item">
            <Glyph name="apps" />
            Applications<span className="ss-size">83.1 GB</span>
          </p>
          <p className="ss-item">
            <Logo width={18} height={14} />
            <span className="ss-two">
              Loft<small>1.2 TB in the cloud</small>
            </span>
            <span className="ss-size">Zero KB</span>
          </p>
        </div>
      </Window>
    )
  if (index === 2)
    return (
      <div className="win w-video">
        <img src="/thumbs/drone.webp" alt="" loading="lazy" />
        <div className="w-video-bar">
          <Lights />
          <b>drone-coast_4k.mp4</b>
        </div>
        <div className="qt">
          <div className="qt-buttons">
            <span>◖</span>
            <span>◀◀　Ⅱ　▶▶</span>
            <Glyph name="share" />
          </div>
          <div className="qt-time">
            <span>12:04</span>
            <span className="qt-scrub">
              <i />
            </span>
            <span>-1:36:16</span>
          </div>
        </div>
      </div>
    )
  if (index === 3)
    return (
      <MenuScene>
        <div className="mb-panel">
          <div className="mb-status">
            <Glyph name="downloads" />
            <span>
              <b>{chromeCopy.transfer.title}</b>
              <small>{chromeCopy.transfer.subtitle}</small>
            </span>
          </div>
          <div className="mb-progress">
            <i />
          </div>
          <i className="mb-sep" />
          <p className="mb-row">
            <Glyph name="search" />
            Search Loft<span>⌃⌥O</span>
          </p>
          <p className="mb-row">
            <FolderIcon />
            Open in Finder
          </p>
          <p className="mb-row">
            <Glyph name="grid" />
            Your Account<span>↗</span>
          </p>
          <p className="mb-row">
            <Glyph name="docs" />
            Send Feedback
          </p>
          <i className="mb-sep" />
          <p className="mb-row">
            <Glyph name="more" />
            Settings…<span>⌘,</span>
          </p>
          <p className="mb-row">
            <Glyph name="eject" />
            Quit Loft<span>⌘Q</span>
          </p>
        </div>
      </MenuScene>
    )
  if (index === 4)
    return (
      <Window title="Client Work">
        <p className="fl-head">
          <span>Name</span>
          <span>Size</span>
        </p>
        {[
          'wedding-film_final.mov',
          'drone-coast_4k.mp4',
          'colour-grade.drp',
          'music-bed.wav',
          'Selects',
        ].map((name, i) => (
          <p className={`fl-row${i === 0 ? ' on' : ''}`} key={name}>
            <Glyph name={i === 4 ? 'disk' : 'docs'} />
            <span className="fl-name">{name}</span>
            <span className="fl-size">
              {['38.6 GB', '12.4 GB', '84 MB', '312 MB', '--'][i]}
            </span>
          </p>
        ))}
        <div className="ctx">
          {chromeCopy.context.map((row, i) => (
            <p className={i === 4 ? 'on' : undefined} key={row}>
              {row}
            </p>
          ))}
        </div>
      </Window>
    )
  return (
    <div className="win w-safari">
      <div className="sf-bar">
        <Lights />
        <Glyph name="back" />
        <Glyph name="forward" />
        <span className="sf-address">loft.app</span>
        <Glyph name="share" />
      </div>
      <div className="sf-page">
        <div className="mock-rq-card">
          <Logo width={25} height={19} />
          <p className="mock-rq-title">{chromeCopy.request.title}</p>
          <p className="sf-sub">{chromeCopy.request.sub}</p>
          <div className="mock-rq-drop">
            <Glyph name="share" />
            <span>
              <b>{chromeCopy.request.choose}</b> {chromeCopy.request.orDrop}
            </span>
          </div>
          <div className="mock-rq-file">
            <Glyph name="docs" />
            <span>
              <b>ceremony_cam-a.mov</b>
              <span className="mock-rq-line">
                <i />
              </span>
            </span>
            <small>62%</small>
          </div>
        </div>
      </div>
    </div>
  )
}
