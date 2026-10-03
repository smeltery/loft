import { useEffect, useState } from 'react'
import { Logo } from './logo'
import { apiOrigin } from './share-id'
import './request.css'

export function SharePage({ id }: { id: string }) {
  const [title, setTitle] = useState(id)
  const search = typeof window === 'undefined' ? '' : window.location.search
  const src = `${apiOrigin()}/s/${id}${search}`
  useEffect(() => {
    fetch(`${apiOrigin()}/s/${id}/meta${search}`)
      .then((res) => res.json())
      .then((body: { name?: string }) => {
        if (body.name) setTitle(body.name)
      })
      .catch(() => undefined)
  }, [id, search])
  return (
    <main className="request">
      <p className="rq-domain">
        <Logo /> loft.app
      </p>
      <p className="rq-title">{title}</p>
      <p className="rq-sub">bytes stream from the loft storage api.</p>
      {/* biome-ignore lint/a11y/useMediaCaption: raw drive bytes, no caption track */}
      <video className="rq-drop" controls src={src} />
    </main>
  )
}
