import { useState } from 'react'
import { catalog, chromeCopy, formatSize } from '@loft/core'
import { Logo } from './logo'
import { apiOrigin } from './share-id'
import './request.css'

export function RequestPage({ token }: { token: string }) {
  const sample = catalog.find((file) => file.id === 'wedding')
  const [note, setNote] = useState('')
  async function send(list: FileList | null) {
    if (!list?.length) return
    for (const file of [...list]) {
      await fetch(`${apiOrigin()}/r/${token}`, {
        method: 'PUT',
        headers: {
          'x-loft-name': file.name,
          'content-type': file.type || 'application/octet-stream',
        },
        body: file,
      })
    }
    setNote('uploaded')
  }
  return (
    <main className="request">
      <p className="rq-domain">
        <Logo /> loft.app
      </p>
      <p className="rq-title">{chromeCopy.request.title}</p>
      <p className="rq-sub">{chromeCopy.request.sub}</p>
      <label className="rq-drop">
        <input
          type="file"
          multiple
          onChange={(e) => void send(e.target.files)}
        />
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
      <p className="rq-size">
        {note || (sample ? formatSize(sample.bytes) : '')}
      </p>
    </main>
  )
}
