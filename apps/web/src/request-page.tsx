import { catalog, chromeCopy, formatSize } from '@loft/core'
import './request.css'

export function RequestPage({ token }: { token: string }) {
  const sample = catalog.find((file) => file.id === 'wedding')
  return (
    <main className="request">
      <p className="rq-domain">loft.app</p>
      <p className="rq-title">{chromeCopy.request.title}</p>
      <p className="rq-sub">{chromeCopy.request.sub}</p>
      <label className="rq-drop">
        <input type="file" multiple />
        <b>{chromeCopy.request.choose}</b> {chromeCopy.request.orDrop}
      </label>
      {sample ? (
        <p className="rq-file">
          <span>{sample.name}</span>
          <span>62%</span>
          <i style={{ width: '62%' }} />
        </p>
      ) : null}
      <p className="rq-token">request {token}</p>
      <p className="rq-size">{sample ? formatSize(sample.bytes) : ''}</p>
    </main>
  )
}
