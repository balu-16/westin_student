import { apiUrl } from './api'

export interface PublicMedia {
  id: string
  entryId: string | null
  revisionId: string | null
  path: string
  mimeType: string
  sizeBytes: number
  width: number | null
  height: number | null
  altText: string | null
  caption: string | null
  focalX: number | null
  focalY: number | null
  sortOrder: number
  status: string
  url: string | null
}

export interface PublishedContentEntry {
  id: string
  entryType: string
  slug: string
  content: Record<string, unknown>
  seo: Record<string, unknown>
  publishedAt: string
  media: PublicMedia[]
}

export interface PublicSitePayload {
  settings: Record<string, unknown>
  entries: PublishedContentEntry[]
}

export interface PublicContentPage {
  items: PublishedContentEntry[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface PublicEnquiryPayload {
  category: 'general' | 'program' | 'campus-visit' | 'admissions'
  name: string
  email?: string
  phone?: string
  programSlug?: string
  message: string
  consent: boolean
  website?: string
}

export interface PublicEnquiryResponse {
  accepted: boolean
  reference: string | null
  status: string
  receivedAt?: string
  duplicate?: boolean
}

export class PublicApiError extends Error {
  status: number
  payload: unknown

  constructor(status: number, payload: unknown) {
    const raw = typeof payload === 'object' && payload !== null && 'message' in payload
      ? (payload as { message?: unknown }).message
      : null
    super(typeof raw === 'string' && raw ? raw : 'Public request failed (' + status + ')')
    this.name = 'PublicApiError'
    this.status = status
    this.payload = payload
  }
}

export async function publicFetch<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers ?? {}) }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  const response = await fetch(apiUrl(path), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
  if (!response.ok) {
    let payload: unknown = null
    try {
      payload = await response.json()
    } catch {
      payload = { message: response.statusText }
    }
    throw new PublicApiError(response.status, payload)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export function publicContentUrl(query: { entryType?: string; q?: string; page?: number; pageSize?: number } = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const suffix = params.toString() ? '?' + params.toString() : ''
  return '/public/content' + suffix
}

export function publicSearchUrl(query: string, page = 1) {
  return publicContentUrl({ q: query, page })
}

export async function submitPublicEnquiry(payload: PublicEnquiryPayload, idempotencyKey?: string) {
  const key =
    idempotencyKey ??
    globalThis.crypto?.randomUUID?.() ??
    'enquiry-' + Date.now() + '-' + Math.random().toString(36).slice(2)
  return publicFetch<PublicEnquiryResponse>('/public/enquiries', {
    method: 'POST',
    headers: { 'Idempotency-Key': key },
    body: payload,
  })
}
