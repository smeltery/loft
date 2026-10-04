import { Logo } from './logo'
import { apiOrigin } from './share-id'
import { useAccountResource } from './account/resource'
import './request.css'

type SharedFile = { name: string; bytes: number; kind: string }

export function SharePage({ id }: { id: string }) {
  const search = typeof window === 'undefined' ? '' : window.location.search
  const path = `/s/${encodeURIComponent(id)}`
  const src = `${apiOrigin()}${path}${search}`
  const { data, error, loading, retry } = useAccountResource<SharedFile>(
    `${path}/meta${search}`,
    '',
  )
  return (
    <main className="request">
      <p className="rq-domain">
        <Logo /> loft
      </p>
      {loading ? (
        <p role="status">loading shared file…</p>
      ) : error ? (
        <>
          <p className="rq-title">file unavailable</p>
          <p className="rq-sub">This link may have expired or been revoked.</p>
          <button type="button" onClick={retry}>
            try again
          </button>
        </>
      ) : data ? (
        <>
          <p className="rq-title">{data.name}</p>
          {data.kind.startsWith('video/') ? (
            // biome-ignore lint/a11y/useMediaCaption: raw user file has no supplied caption track.
            <video className="rq-preview" controls src={src} />
          ) : data.kind.startsWith('image/') ? (
            <img className="rq-preview" src={src} alt={data.name} />
          ) : null}
          <a href={src} target="_blank" rel="noreferrer">
            open file
          </a>
        </>
      ) : null}
    </main>
  )
}
