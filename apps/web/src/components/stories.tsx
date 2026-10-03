import { chromeCopy } from '@loft/core'
import { stories } from '../copy'
import './stories.css'

export default function Stories() {
  return (
    <section className="stories wrap">
      <h2>your files in the cloud. zero on your mac.</h2>
      <p>
        loft looks like a normal drive. open a film and it plays right away,
        because your mac only grabs the part it needs.
      </p>
      <p className="lede tight">made for big files.</p>
      <ol className="moments">
        {stories.map((story, i) => (
          <li key={story.kicker}>
            {mock(i)}
            <h3>{story.kicker}</h3>
            <p>{story.title}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function mock(i: number) {
  if (i === 0) {
    return (
      <div className="win">
        <div className="mb">
          <span>Finder</span>
          <span>File</span>
          <span>Edit</span>
          <b>Thu 6:42 PM</b>
        </div>
        <div className="hud">
          <strong>{chromeCopy.drop.release}</strong>
          <span>{chromeCopy.drop.item}</span>
        </div>
        <p className="hint">{chromeCopy.drop.intoFolder}</p>
        <p>Client Work</p>
        <p>Films</p>
      </div>
    )
  }
  if (i === 1) {
    return (
      <div className="win">
        <p className="ss-row">
          <b>Macintosh HD</b>
          <span>214.6 of 245.1 GB</span>
        </p>
        <div className="ss-bar">
          <i />
          <i />
          <i />
        </div>
        <p className="ss-item">
          Applications
          <span>83.1 GB</span>
        </p>
        <p className="ss-item on">
          Loft
          <span>1.2 TB in the cloud · Zero KB</span>
        </p>
      </div>
    )
  }
  if (i === 2) {
    return (
      <div className="win dark">
        <b>drone-coast_4k.mp4</b>
        <p>12:04–1:36:16</p>
        <div className="scrub">
          <i />
        </div>
      </div>
    )
  }
  if (i === 3) {
    return (
      <div className="win">
        <p className="xfer">{chromeCopy.transfer.title}</p>
        <p className="hint">{chromeCopy.transfer.subtitle}</p>
      </div>
    )
  }
  if (i === 4) {
    return (
      <div className="win">
        <div className="ctx">
          {chromeCopy.context.map((row) => (
            <p key={row}>{row}</p>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="win">
      <p className="hint">loft.app</p>
      <b>{chromeCopy.request.title}</b>
      <p className="hint">{chromeCopy.request.sub}</p>
      <p className="drop-box">
        {chromeCopy.request.choose} {chromeCopy.request.orDrop}
      </p>
    </div>
  )
}
