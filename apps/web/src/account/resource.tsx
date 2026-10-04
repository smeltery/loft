import { useEffect, useState } from 'react'
import { accountRequest, errorMessage } from './api'

export function useAccountResource<T>(path: string, token: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const [loading, setLoading] = useState(true)
  // biome-ignore lint/correctness/useExhaustiveDependencies: revision explicitly retries the same request.
  useEffect(() => {
    const controller = new AbortController()
    setData(null)
    setError(null)
    setLoading(true)
    accountRequest<T>(path, token, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setData(data)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(error))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [path, token, revision])
  return {
    data,
    setData,
    error,
    loading,
    retry: () => setRevision((n) => n + 1),
  }
}

export function ResourceError({
  message,
  retry,
}: {
  message: string
  retry: () => void
}) {
  return (
    <article className="card" role="alert">
      <p>{message}</p>
      <button className="account-action" type="button" onClick={retry}>
        try again
      </button>
    </article>
  )
}
