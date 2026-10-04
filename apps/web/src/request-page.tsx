import { useState } from 'react'
import { chromeCopy } from '@loft/core'
import { Logo } from './logo'
import { apiOrigin } from './share-id'
import { useAccountResource } from './account/resource'
import './request.css'

type UploadResult = {
  id: string
  name: string
  status: 'uploading' | 'uploaded' | 'failed'
}

export function RequestPage({ token }: { token: string }) {
  const { data, error, loading } = useAccountResource<{ folder: string }>(
    `/r/${encodeURIComponent(token)}`,
    '',
  )
  const [files, setFiles] = useState<UploadResult[]>([])
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState('')
  async function send(list: FileList | null) {
    if (!list?.length || busy || !data) return
    setBusy(true)
    setFailure('')
    const selected = [...list]
    setFiles(
      selected.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        status: 'uploading',
      })),
    )
    for (const [index, file] of selected.entries()) {
      let status: UploadResult['status'] = 'uploaded'
      try {
        const response = await fetch(
          `${apiOrigin()}/r/${encodeURIComponent(token)}`,
          {
            method: 'PUT',
            headers: {
              'x-loft-name': file.name,
              'content-type': file.type || 'application/octet-stream',
            },
            body: file,
          },
        )
        if (!response.ok)
          throw new Error(
            response.status === 404
              ? 'This request is closed or expired.'
              : 'Upload failed. Select the failed files to retry.',
          )
      } catch (error) {
        status = 'failed'
        setFailure(
          error instanceof Error ? error.message : 'Upload failed. Try again.',
        )
      }
      setFiles((current) =>
        current.map((row, i) => (i === index ? { ...row, status } : row)),
      )
    }
    setBusy(false)
  }
  return (
    <main className="request">
      <p className="rq-domain">
        <Logo /> loft
      </p>
      <p className="rq-title">{chromeCopy.request.title}</p>
      <p className="rq-sub">{chromeCopy.request.sub}</p>
      {loading ? (
        <p role="status">loading request…</p>
      ) : error ? (
        <p role="alert">
          This request is unavailable. It may have expired or been closed.
        </p>
      ) : (
        <>
          <p className="rq-sub">destination: {data?.folder}</p>
          <label
            className="rq-drop"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              void send(event.dataTransfer.files)
            }}
          >
            <input
              type="file"
              multiple
              disabled={busy}
              aria-label="choose files"
              onChange={(event) => {
                void send(event.target.files)
                event.target.value = ''
              }}
            />
            <span>
              <b>{busy ? 'uploading…' : chromeCopy.request.choose}</b>{' '}
              {busy ? '' : chromeCopy.request.orDrop}
            </span>
          </label>
        </>
      )}
      {files.map((file) => (
        <p className="rq-file" key={file.id}>
          <span>{file.name}</span>
          <span>{file.status}</span>
        </p>
      ))}
      {failure && (
        <p className="rq-sub" role="alert">
          {failure}
        </p>
      )}
      {!busy && files.length > 0 && !failure && (
        <p role="status">all files uploaded</p>
      )}
    </main>
  )
}
