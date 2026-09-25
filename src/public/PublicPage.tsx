import { useEffect, useState } from 'react'
import { ArrowUpRight, CalendarDays, Check, FileText, Images, MapPin, Mail, Phone, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { fixturePrograms, fixtureStories, getFixturePage, publicPageCopy, type PublicPageKind } from './content'
import { ErrorState } from '../components/ErrorState'
import { PageLoader } from '../components/Loading'
import type { PublishedContentEntry } from '../lib/publicApi'
import { PUBLIC_CONTENT_MODE, usePublishedEntry } from './usePublicContent'
import { publicFetch, publicSearchUrl } from '../lib/publicApi'
import { ContactHandoff } from './ContactHandoff'

function PageIntro({ kind, title, summary }: { kind: PublicPageKind; title?: string; summary?: string }) {
  const copy = publicPageCopy[kind]
  return (
    <section className="border-b border-[#d9eaf3] bg-gradient-to-br from-[#eaf6ff] via-[#f7fbff] to-[#dff3ff]">
      <div className="mx-auto max-w-[1360px] px-5 py-14 sm:px-8 lg:px-12 lg:py-24">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#35728f]">{copy.eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.07em] text-[#142d46] sm:text-7xl">
          {title ?? copy.title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[#42647a] sm:text-lg">{summary ?? copy.summary}</p>
      </div>
    </section>
  )
}

function ProgramIndex() {
  return (
    <div className="mx-auto max-w-[1360px] px-5 py-14 sm:px-8 lg:px-12 lg:py-24">
      <div className="grid gap-5 lg:grid-cols-3">
        {fixturePrograms.map((program) => (
          <article key={program.slug} className="flex flex-col rounded-[28px] border border-[#cce7f7] bg-white p-6 shadow-[0_16px_36px_rgba(28,92,128,.07)]">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#35728f]">{program.label}</span>
            <h2 className="mt-6 text-3xl font-bold tracking-[-0.05em] text-[#142d46]">{program.title}</h2>
            <p className="mt-4 flex-1 text-sm leading-7 text-[#557184]">{program.summary}</p>
            <ul className="mt-6 grid gap-2 text-sm font-semibold text-[#325d77]">
              {program.facts.map((fact) => (
                <li key={fact} className="flex items-center gap-2">
                  <Check size={15} className="text-[#3ba7f2]" aria-hidden="true" />
                  {fact}
                </li>
              ))}
            </ul>
            <Link to={`/programs/${program.slug}`} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#1468aa]">
              Explore pathway <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}

function ProgramDetail({ slug }: { slug: string }) {
  const program = fixturePrograms.find((item) => item.slug === slug)
  if (!program) return <NotFound />
  return (
    <div className="mx-auto max-w-[1360px] px-5 py-14 sm:px-8 lg:px-12 lg:py-24">
      <Link to="/programs" className="text-sm font-bold text-[#1468aa]">← All programs</Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#35728f]">{program.label}</p>
          <h2 className="mt-5 max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.07em] text-[#142d46] sm:text-7xl">{program.title}</h2>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#42647a]">{program.detail}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/admissions#visit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1468aa] px-5 text-sm font-bold text-white">
              Ask about this pathway <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#afd5e8] bg-white px-5 text-sm font-bold text-[#1468aa]">
              Contact Westin
            </Link>
          </div>
        </div>
        <aside className="rounded-[30px] border border-[#cce7f7] bg-[#eaf6ff] p-7">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#35728f]">At a glance</p>
          <ul className="mt-6 grid gap-4">
            {program.facts.map((fact) => (
              <li key={fact} className="flex gap-3 border-b border-[#c5e1ef] pb-4 text-sm font-semibold text-[#325d77] last:border-0">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: program.color }} aria-hidden="true" />
                {fact}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-6 text-[#557184]">Eligibility, duration, curriculum, fees, and current intake details will be shown only after college approval.</p>
        </aside>
      </div>
    </div>
  )
}

function EditorialPage({ kind }: { kind: PublicPageKind }) {
  const copy = publicPageCopy[kind]
  const isContact = kind === 'contact'
  const isAdmissions = kind === 'admissions'
  const cards = kind === 'news' || kind === 'campus-events' || kind === 'magazine' || kind === 'gallery'

  return (
    <>
      <PageIntro kind={kind} />
      <div className="mx-auto max-w-[1360px] px-5 py-14 sm:px-8 lg:px-12 lg:py-24">
        {cards ? (
          <div className="grid gap-5 md:grid-cols-3">
            {fixtureStories.map((story, index) => (
              <article key={story.id} className="rounded-[26px] border border-[#d4e8f2] bg-white p-5 shadow-[0_12px_30px_rgba(27,96,133,.06)]">
                <div className={`h-40 rounded-[20px] bg-gradient-to-br ${index === 0 ? 'from-[#c1eaff] to-[#438dbd]' : index === 1 ? 'from-[#ffe2bb] to-[#cb7651]' : 'from-[#d5f1e2] to-[#5c9d8b]'}`} aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#35728f]">{story.eyebrow}</p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-[#142d46]">{story.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#557184]">{story.summary}</p>
              </article>
            ))}
          </div>
        ) : isContact || isAdmissions ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div id={isAdmissions ? 'visit' : undefined} className="rounded-[28px] border border-[#cce7f7] bg-white p-6 shadow-[0_14px_35px_rgba(28,92,128,.06)] sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#35728f]">{isAdmissions ? 'Plan a visit' : 'A clear next step'}</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-[#142d46]">{isAdmissions ? 'Start a conversation about Westin.' : 'Questions are welcome.'}</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#557184]">
                {isAdmissions
                  ? 'Tell the college what you are exploring and the team can help with current program and visit information.'
                  : copy.summary}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1468aa] px-5 text-sm font-bold text-white">
                  View contact details <Mail size={16} aria-hidden="true" />
                </Link>
                <Link to="/programs" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#afd5e8] bg-white px-5 text-sm font-bold text-[#1468aa]">
                  Explore programs
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] border border-[#cce7f7] bg-[#eaf6ff] p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#35728f]">Information to verify</p>
              <ul className="mt-5 grid gap-4 text-sm leading-7 text-[#42647a]">
                <li className="flex gap-3"><MapPin size={18} className="mt-1 shrink-0 text-[#1468aa]" aria-hidden="true" />Campus address and directions</li>
                <li className="flex gap-3"><Phone size={18} className="mt-1 shrink-0 text-[#1468aa]" aria-hidden="true" />Current phone and visit contact</li>
                <li className="flex gap-3"><FileText size={18} className="mt-1 shrink-0 text-[#1468aa]" aria-hidden="true" />Approved requirements and intake dates</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              ['A clear beginning', 'Understand the college, its people, and the values that shape the student experience.'],
              ['Useful practice', 'See how approved learning experiences connect ideas with the world beyond a classroom.'],
              ['A supported next step', 'Find current information and people who can answer the practical questions.'],
            ].map(([title, body]) => (
              <article key={title} className="rounded-[26px] border border-[#d4e8f2] bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf6ff] text-[#1468aa]">
                  {kind === 'campus' ? <Images size={20} aria-hidden="true" /> : kind === 'placements' ? <ArrowUpRight size={20} aria-hidden="true" /> : <Check size={20} aria-hidden="true" />}
                </div>
                <h2 className="mt-6 text-2xl font-bold tracking-[-0.04em] text-[#142d46]">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#557184]">{body}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export function PublicPage() {
  const { pathname } = useLocation()
  const page = getFixturePage(pathname)
  const contactHandoff = page?.kind === 'contact' || page?.kind === 'admissions'
  const apiTarget = PUBLIC_CONTENT_MODE === 'api' && !contactHandoff ? resolveApiTarget(pathname, page?.kind ?? null) : null
  const published = usePublishedEntry(apiTarget?.entryType ?? null, apiTarget?.slug ?? null)
  if (!page) return <NotFound />
  if (contactHandoff) return <ContactHandoff visit={page.kind === 'admissions'} />
  if (PUBLIC_CONTENT_MODE === 'api') {
    if (published.loading) return <PageLoader label="Opening published page" className="min-h-[60vh]" />
    if (published.error) return <div className="mx-auto max-w-[900px] px-5 py-24 sm:px-8"><ErrorState message={published.error} /></div>
    if (!published.data) return <NotFound />
    return <PublishedPage entry={published.data} />
  }
  if (page.program) {
    return (
      <div data-public-fixture="true">
        <PageIntro kind="programs" title={page.program.title} summary={page.program.summary} />
        <ProgramDetail slug={page.program.slug} />
      </div>
    )
  }
  if (page.kind === 'programs') {
    return (
      <div data-public-fixture="true">
        <PageIntro kind="programs" />
        <ProgramIndex />
      </div>
    )
  }
  return <div data-public-fixture="true"><EditorialPage kind={page.kind} /></div>
}

function PublishedPage({ entry }: { entry: PublishedContentEntry }) {
  const content = entry.content
  const bullets = Array.isArray(content.bullets) ? content.bullets.filter((item): item is string => typeof item === 'string') : []
  return (
    <>
      <PageIntro kind="about" title={contentText(content, 'title') || entry.slug} summary={contentText(content, 'summary')} />
      <div className="mx-auto max-w-[1000px] px-5 py-14 sm:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.45fr]">
          <article className="rounded-[28px] border border-[#d4e8f2] bg-white p-7 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#35728f]">{contentText(content, 'eyebrow')}</p>
            <div className="mt-6 whitespace-pre-line text-base leading-8 text-[#42647a]">{contentText(content, 'body')}</div>
          </article>
          {bullets.length > 0 && (
            <aside className="rounded-[28px] border border-[#cce7f7] bg-[#eaf6ff] p-7">
              <h2 className="text-lg font-bold text-[#142d46]">At a glance</h2>
              <ul className="mt-5 grid gap-3 text-sm leading-6 text-[#42647a]">{bullets.map((item) => <li key={item} className="border-l-2 border-[#f2a159] pl-3">{item}</li>)}</ul>
            </aside>
          )}
        </div>
      </div>
    </>
  )
}

function contentText(content: Record<string, unknown>, key: string) {
  const value = content[key]
  return typeof value === 'string' ? value : ''
}

function resolveApiTarget(pathname: string, kind: PublicPageKind | null) {
  const clean = pathname.replace(/\/$/, '') || '/'
  if (!kind) return null
  if (kind === 'programs' && clean.startsWith('/programs/')) {
    return { entryType: 'program', slug: clean.slice('/programs/'.length) }
  }
  const typeByKind: Partial<Record<PublicPageKind, string>> = {
    about: 'page',
    partners: 'page',
    'why-westin': 'page',
    programs: 'page',
    campus: 'page',
    placements: 'page',
    news: 'news',
    blog: 'blog',
    'campus-events': 'event-story',
    gallery: 'gallery',
    magazine: 'magazine',
    testimonials: 'testimonial',
    'success-stories': 'success-story',
    admissions: 'page',
    contact: 'page',
  }
  return { entryType: typeByKind[kind] ?? 'page', slug: clean.slice(1).replace(/\//g, '-') || 'home' }
}

export function PublicSearch() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [result, setResult] = useState<{ items: PublishedContentEntry[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (PUBLIC_CONTENT_MODE !== 'api') return
    let cancelled = false
    setLoading(true)
    setError(null)
    publicFetch<{ items: PublishedContentEntry[] }>(publicSearchUrl(submitted))
      .then((data) => {
        if (!cancelled) setResult(data)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Search could not be completed.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [submitted])

  return (
    <>
      <PageIntro kind="news" title="Search the public story." summary="Search only the content that has been approved and published for visitors." />
      <div data-public-fixture={PUBLIC_CONTENT_MODE === 'fixture' ? 'true' : undefined} className="mx-auto max-w-[1360px] px-5 py-14 sm:px-8 lg:px-12 lg:py-24">
        <form onSubmit={(event) => { event.preventDefault(); setSubmitted(query.trim()) }} className="mx-auto flex max-w-3xl gap-2 rounded-2xl border border-[#cce7f7] bg-white p-2 shadow-[0_10px_30px_rgba(27,96,133,.06)]">
          <label htmlFor="public-search" className="sr-only">Search published content</label>
          <input id="public-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search programs, stories, and campus life" className="min-h-12 min-w-0 flex-1 rounded-xl bg-[#f7fbff] px-4 text-base text-[#142d46] outline-none ring-[#3ba7f2] placeholder:text-[#7891a1] focus:ring-2" />
          <button type="submit" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#1468aa] px-4 text-sm font-bold text-white"><Search size={16} aria-hidden="true" />Search</button>
        </form>
        {PUBLIC_CONTENT_MODE === 'fixture' ? (
          <div className="mt-8 rounded-[28px] border border-[#cce7f7] bg-white p-8 text-center">
            <CalendarDays size={28} className="mx-auto text-[#1468aa]" aria-hidden="true" />
            <p className="mt-4 text-sm leading-7 text-[#557184]">Search is wired to the published-content API contract. Local fixture mode does not invent search results.</p>
          </div>
        ) : loading ? <PageLoader label="Searching published content" size={86} className="min-h-[240px]" /> : error ? <div className="mt-8"><ErrorState message={error} /></div> : (
          <div className="mt-8 grid gap-4">
            {result?.items.length ? result.items.map((entry) => (
              <Link key={entry.id} to={publicEntryPath(entry)} className="rounded-[24px] border border-[#d4e8f2] bg-white p-6 transition hover:border-[#3ba7f2]">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#35728f]">{entry.entryType}</p>
                <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#142d46]">{contentText(entry.content, 'title') || entry.slug}</h2>
                <p className="mt-2 text-sm leading-7 text-[#557184]">{contentText(entry.content, 'summary')}</p>
              </Link>
            )) : <div className="rounded-[28px] border border-dashed border-[#cce7f7] p-10 text-center text-sm text-[#557184]">No published pages matched that search.</div>}
          </div>
        )}
      </div>
    </>
  )
}

function publicEntryPath(entry: PublishedContentEntry) {
  if (entry.entryType === 'program') return '/programs/' + entry.slug
  if (entry.entryType === 'news' || entry.entryType === 'blog') return '/' + entry.entryType + '/' + entry.slug
  if (entry.entryType === 'event-story') return '/campus/events/' + entry.slug
  if (entry.entryType === 'gallery') return '/gallery/' + entry.slug
  if (entry.entryType === 'magazine') return '/magazine/' + entry.slug
  return '/' + entry.slug
}

export function NotFound() {
  return (
    <section className="mx-auto max-w-[900px] px-5 py-24 text-center sm:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#35728f]">Page not found</p>
      <h1 className="mt-5 text-5xl font-bold tracking-[-0.07em] text-[#142d46]">That page has turned.</h1>
      <p className="mx-auto mt-5 max-w-lg text-base leading-8 text-[#557184]">Try the homepage or explore the programs currently available.</p>
      <Link to="/" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#1468aa] px-5 text-sm font-bold text-white">
        Back to Westin <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </section>
  )
}
