import { useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  FolderOpen,
  MoreVertical,
  Presentation,
  Search,
  Sheet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Header } from '../components/Header'
import { StatCard } from '../components/StatCard'
import { Card } from '../components/Card'
import { SkeletonCards, SkeletonRows } from '../components/Loading'
import { ErrorState } from '../components/ErrorState'
import { formatBytes, formatDateLabel, useApi, type MaterialsPayload } from '../lib/api'
import type { FileType } from '../types'
import { cx } from '../utils'
import type { DashboardLayoutContext } from '../layouts/DashboardLayout'

const fileTypeMeta: Record<FileType, { label: string; color: string; bg: string }> = {
  pdf: { label: 'PDF', color: '#EF4444', bg: '#FEE2E2' },
  docx: { label: 'DOCX', color: '#3BA7F2', bg: '#EAF6FF' },
  pptx: { label: 'PPTX', color: '#F59E0B', bg: '#FEF3C7' },
  xlsx: { label: 'XLSX', color: '#16A34A', bg: '#DCFCE7' },
}

const typeIcons: Record<FileType, LucideIcon> = {
  pdf: FileText,
  docx: FileText,
  pptx: Presentation,
  xlsx: Sheet,
}

interface MaterialRow {
  id: string
  name: string
  subtitle: string
  type: FileType
  subject: string
  uploadedBy: string
  date: string
  size: string
  addedAt: number
  downloadUrl: string | null
}

function FileTypeBadge({ type }: { type: FileType }) {
  const Icon = typeIcons[type]
  const meta = fileTypeMeta[type]
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: meta.bg, color: meta.color }}
      aria-label={`${meta.label} file`}
    >
      <Icon size={20} aria-hidden="true" />
    </span>
  )
}

function DownloadAction({ url }: { url?: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          if (url) window.open(url, '_blank', 'noopener,noreferrer')
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 px-3 py-1.5 text-xs font-semibold text-primary-dark transition-colors duration-200 hover:bg-primary hover:text-white"
      >
        <Download size={13} aria-hidden="true" />
        Download
      </button>
      <button
        type="button"
        aria-label="More actions"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft transition-colors duration-200 hover:bg-primary-light hover:text-primary-dark"
      >
        <MoreVertical size={15} aria-hidden="true" />
      </button>
    </div>
  )
}

export function StudyMaterials() {
  const { openMenu } = useOutletContext<DashboardLayoutContext>()
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('latest')
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const foldersRef = useRef<HTMLDivElement>(null)
  const PAGE_SIZE = 20

  // Debounce the search box so we hit /api/materials once typing settles.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const path = (() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (subjectId) params.set('subjectId', subjectId)
    if (sort && sort !== 'latest') params.set('sort', sort)
    params.set('page', String(page))
    params.set('pageSize', String(PAGE_SIZE))
    const qs = params.toString()
    return `/materials${qs ? `?${qs}` : ''}`
  })()

  const { data, error, loading, reload } = useApi<MaterialsPayload>(path, [path])

  const pending = loading && !data
  const failed = error && !data

  const files = useMemo<MaterialRow[]>(
    () =>
      (data?.files ?? []).map((f) => ({
        id: f.id,
        name: f.name,
        subtitle: f.description ?? '',
        type: f.type,
        subject: f.subject ?? 'General',
        uploadedBy: f.uploadedBy ?? 'Faculty',
        date: formatDateLabel(f.date),
        size: formatBytes(f.size),
        addedAt: Date.parse(f.date),
        downloadUrl: f.downloadUrl,
      })),
    [data],
  )

  const folders = useMemo(
    () => (data?.folders ?? []).map((f) => ({ id: f.id, subject: f.name, fileCount: f.fileCount })),
    [data],
  )

  const stats = data?.stats
  const recentlyAdded = useMemo(
    () => files.filter((f) => Date.now() - f.addedAt < 7 * 24 * 60 * 60 * 1000).length,
    [files],
  )

  const scrollFolders = (direction: 1 | -1) => {
    foldersRef.current?.scrollBy({ left: direction * 260, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      <Header
        title="Study Materials"
        subtitle="Access and download study materials shared by your faculty"
        onMenuClick={openMenu}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/70"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search materials..."
                aria-label="Search materials"
                className="h-10 w-44 rounded-xl border border-line bg-white pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/60 transition-colors duration-200 focus:border-primary focus:outline-none sm:w-56"
              />
            </div>
            <button
              type="button"
              aria-label="Filter materials"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-ink-soft transition-colors duration-200 hover:border-primary/40 hover:text-primary"
            >
              <Filter size={16} aria-hidden="true" />
            </button>
          </div>
        }
      />

      {failed ? (
        <ErrorState message={error ?? undefined} onRetry={reload} />
      ) : pending ? (
        <>
          {/* Statistics */}
          <SkeletonCards />

          {/* Subject folders */}
          <section aria-label="Subjects">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Subjects</h2>
            </div>
            <div role="status" className="flex gap-4 overflow-hidden pb-2">
              {Array.from({ length: 6 }, (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="h-[80px] w-[230px] shrink-0 animate-pulse rounded-2xl bg-primary-lighter"
                />
              ))}
            </div>
          </section>

          {/* All materials table */}
          <Card className="p-0 sm:p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-ink">All Materials</h2>
            </div>
            <div className="p-5 sm:p-6">
              <SkeletonRows rows={5} />
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Statistics */}
          <section aria-label="Material statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={FolderOpen} title="Total Folders" value={String(stats?.subjects ?? 0)} footnote="Organized by Subject" />
            <StatCard
              icon={FileText}
              title="Total Files"
              value={String(stats?.totalFiles ?? 0)}
              footnote="Available to Download"
              footnoteClassName="text-primary-dark"
            />
            <StatCard
              icon={Download}
              title="Total Size"
              value={formatBytes(stats?.totalSize ?? 0)}
              footnote="Across All Files"
            />
            <StatCard
              icon={Presentation}
              title="Recently Added"
              value={String(recentlyAdded)}
              footnote="New this Week"
              footnoteClassName="text-success"
            />
          </section>

          {/* Subject folders */}
          <section aria-label="Subjects">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Subjects</h2>
              <button
                type="button"
                onClick={() => scrollFolders(1)}
                aria-label="Scroll to more subjects"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink-soft transition-colors duration-200 hover:border-primary/40 hover:text-primary"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
            <div
              ref={foldersRef}
              className="flex snap-x gap-4 overflow-x-auto pb-2 scrollbar-thin"
            >
              <button
                type="button"
                onClick={() => { setSubjectId(null); setPage(1) }}
                className={cx('group flex w-[230px] shrink-0 snap-start items-center gap-3.5 rounded-2xl border p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover', !subjectId ? 'border-primary bg-primary-light/50' : 'border-line bg-white hover:border-primary/30')}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary-dark group-hover:bg-primary group-hover:text-white">
                  <FolderOpen size={22} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">All</span>
                  <span className="mt-0.5 block text-xs text-ink-soft">{stats?.totalFiles ?? 0} Files</span>
                </span>
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id ?? 'general'}
                  type="button"
                  onClick={() => { setSubjectId(folder.id); setPage(1) }}
                  className={cx('group flex w-[230px] shrink-0 snap-start items-center gap-3.5 rounded-2xl border p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover', subjectId === folder.id ? 'border-primary bg-primary-light/50' : 'border-line bg-white hover:border-primary/30')}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary-dark transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                    <FolderOpen size={22} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink" title={folder.subject}>
                      {folder.subject}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-soft">{folder.fileCount} Files</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* All materials table */}
          <Card className="p-0 sm:p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-ink">All Materials</h2>
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                Sort by
                <select
                  aria-label="Sort materials"
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1) }}
                  className="h-9 rounded-lg border border-line bg-white px-2.5 text-sm font-medium text-ink focus:border-primary focus:outline-none"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="size">Size</option>
                </select>
              </label>
            </div>

            {/* Table (md+) */}
            <div className="hidden overflow-x-auto md:block scrollbar-thin">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                    <th scope="col" className="px-6 py-3.5 font-semibold">File Name</th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Subject</th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Uploaded By</th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Date</th>
                    <th scope="col" className="px-4 py-3.5 font-semibold">Size</th>
                    <th scope="col" className="px-6 py-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr
                      key={file.id}
                      className="border-b border-line/70 transition-colors duration-150 last:border-0 hover:bg-primary-lighter/60"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <FileTypeBadge type={file.type} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">{file.name}</p>
                            <p className="truncate text-xs text-ink-soft">{file.subtitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-ink-soft">{file.subject}</td>
                      <td className="px-4 py-3.5 text-ink-soft">{file.uploadedBy}</td>
                      <td className="px-4 py-3.5 text-ink-soft">{file.date}</td>
                      <td className="px-4 py-3.5 text-ink-soft">{file.size}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex justify-end">
                          <DownloadAction url={file.downloadUrl} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card list (mobile) */}
            <ul className="divide-y divide-line md:hidden">
              {files.map((file) => (
                <li key={file.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <FileTypeBadge type={file.type} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{file.name}</p>
                      <p className="truncate text-xs text-ink-soft">{file.subtitle}</p>
                      <p className="mt-1.5 text-xs text-ink-soft">
                        {file.subject} • {file.uploadedBy}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {file.date} • {file.size}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <DownloadAction url={file.downloadUrl} />
                  </div>
                </li>
              ))}
            </ul>

            {!loading && files.length === 0 && (
              <p className="px-6 py-10 text-center text-sm text-ink-soft">
                No materials found for &ldquo;{query}&rdquo;.
              </p>
            )}

            {/* Pagination — only when more than one page */}
            {(() => {
              const pagination = (data as any)?.pagination
              const total: number = pagination?.total ?? files.length
              const totalPages: number = pagination?.totalPages ?? (total > PAGE_SIZE ? Math.ceil(total / PAGE_SIZE) : 1)
              if (totalPages <= 1) return null
              const start = (page - 1) * PAGE_SIZE + 1
              const end = Math.min(page * PAGE_SIZE, total)
              const pages: (number | string)[] = totalPages <= 5 ? Array.from({ length: totalPages }, (_, i) => i + 1) : page <= 3 ? [1, 2, 3, '…', totalPages] : page >= totalPages - 2 ? [1, '…', totalPages - 2, totalPages - 1, totalPages] : [1, '…', page - 1, page, page + 1, '…', totalPages]
              return (
                <div className="flex items-center justify-between border-t border-line px-5 py-4 sm:px-6">
                  <p className="text-xs text-ink-soft sm:text-sm">
                    Showing <strong className="text-ink">{start}–{end}</strong> of <strong className="text-ink">{total}</strong> files
                  </p>
                  <nav aria-label="Pagination" className="flex items-center gap-1">
                    <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-soft disabled:opacity-40">
                      <ChevronLeft size={15} aria-hidden="true" />
                    </button>
                    {pages.map((p, idx) =>
                      typeof p === 'string' ? (
                        <span key={`e-${idx}`} className="px-1 text-sm text-ink-soft">…</span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          aria-current={p === page ? 'page' : undefined}
                          onClick={() => setPage(p as number)}
                          className={cx('h-8 w-8 rounded-lg text-sm font-semibold transition-colors duration-200', p === page ? 'bg-primary text-white' : 'text-ink-soft hover:bg-primary-light hover:text-primary-dark')}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-soft disabled:opacity-40 hover:border-primary/40 hover:text-primary">
                      <ChevronRight size={15} aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              )
            })()}
          </Card>
        </>
      )}
    </div>
  )
}
