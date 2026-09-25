import { useEffect, useState } from 'react'
import { publicFetch, type PublishedContentEntry, type PublicSitePayload } from '../lib/publicApi'

export const PUBLIC_CONTENT_MODE = import.meta.env.VITE_PUBLIC_CONTENT_MODE === 'api' ? 'api' : 'fixture'

interface PublicRequestState<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export function usePublishedSite(enabled = PUBLIC_CONTENT_MODE === 'api'): PublicRequestState<PublicSitePayload> {
  return usePublicRequest<PublicSitePayload>(enabled ? '/public/site' : null)
}

export function usePublishedEntry(
  entryType: string | null,
  slug: string | null,
): PublicRequestState<PublishedContentEntry> {
  const path = entryType && slug
    ? '/public/content/' + encodeURIComponent(entryType) + '/' + encodeURIComponent(slug)
    : null
  return usePublicRequest<PublishedContentEntry>(path)
}

function usePublicRequest<T>(path: string | null): PublicRequestState<T> {
  const [state, setState] = useState<PublicRequestState<T>>({
    data: null,
    error: null,
    loading: path !== null,
  })

  useEffect(() => {
    if (!path) {
      setState({ data: null, error: null, loading: false })
      return
    }
    let cancelled = false
    setState({ data: null, error: null, loading: true })
    publicFetch<T>(path)
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false })
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : 'Published content could not be loaded.',
            loading: false,
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [path])

  return state
}
