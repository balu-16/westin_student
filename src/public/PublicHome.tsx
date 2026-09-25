import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, BookOpen, ChevronRight, Compass, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CampusIllustration } from '../components/CampusIllustration'
import { fixturePrograms, fixtureStories } from './content'
import { ErrorState } from '../components/ErrorState'
import { PageLoader } from '../components/Loading'
import { PUBLIC_CONTENT_MODE, usePublishedSite } from './usePublicContent'

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#35728f]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#f2a159] shadow-[0_0_0_4px_rgba(242,161,89,.14)]" aria-hidden="true" />
      {children}
    </p>
  )
}

function PaperPhoto({ label, tone }: { label: string; tone: 'blue' | 'orange' | 'mint' }) {
  const colors = {
    blue: 'from-[#b7e4fb] via-[#73bce8] to-[#2b80b7]',
    orange: 'from-[#ffe3bd] via-[#f4ad70] to-[#c96f4a]',
    mint: 'from-[#c8f0df] via-[#8bcaae] to-[#478f87]',
  } as const
  return (
    <div className={`relative min-h-44 overflow-hidden rounded-[24px] bg-gradient-to-br ${colors[tone]} p-5 shadow-[0_18px_35px_rgba(28,92,128,.12)]`}>
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full border border-white/30" aria-hidden="true" />
      <div className="absolute bottom-5 left-5 h-16 w-24 rounded-t-[50%] border-2 border-white/50 border-b-0" aria-hidden="true" />
      <span className="relative z-10 rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#244f69]">
        {label}
      </span>
      <span className="absolute bottom-4 right-5 text-5xl font-bold text-white/35" aria-hidden="true">✦</span>
    </div>
  )
}

export function PublicHome() {
  const published = usePublishedSite()
  const [selectedProgram, setSelectedProgram] = useState(fixturePrograms[0])

  if (PUBLIC_CONTENT_MODE === 'api') {
    if (published.loading) return <PageLoader label="Opening published Westin content" className="min-h-[60vh]" />
    if (published.error) return <div className="mx-auto max-w-[900px] px-5 py-24 sm:px-8"><ErrorState message={published.error} /></div>
    return <PublishedHome entries={published.data?.entries ?? []} />
  }

  return (
    <div data-public-fixture="true">
      <section className="mx-auto grid max-w-[1360px] gap-8 px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-10 lg:px-12 lg:pb-24 lg:pt-16">
        <div className="relative z-10">
          <SectionLabel>Your next chapter starts here</SectionLabel>
          <h1 className="mt-6 max-w-xl text-[clamp(3rem,7vw,5.75rem)] font-bold leading-[0.95] tracking-[-0.07em] text-[#142d46]">
            Big dreams.
            <span className="relative block text-[#176caf]">
              Bright beginnings.
              <span className="absolute -bottom-3 left-0 h-2 w-48 -rotate-2 rounded-[50%] border-t-4 border-[#f2a159]" aria-hidden="true" />
            </span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-8 text-[#42647a] sm:text-lg">
            Discover business, hospitality, and a campus full of possibility. Take one useful step toward the future you are imagining.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/programs"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1468aa] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(20,104,170,.2)] transition hover:bg-[#0f527f]"
            >
              Explore programs <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <Link
              to="/admissions#visit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#afd5e8] bg-white/80 px-5 text-sm font-bold text-[#1468aa] transition hover:border-[#3ba7f2]"
            >
              Plan a campus visit <ArrowDownRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-8 text-sm font-semibold text-[#6a8190]">
            Learn. Grow. Belong.
          </p>
        </div>

        <div className="relative min-h-[440px] sm:min-h-[540px] lg:min-h-[610px]" aria-label="Illustration of an open sketchbook becoming a campus and a path forward">
          <div className="absolute inset-4 rotate-[-2deg] rounded-[34px] border border-white/80 bg-white/75 shadow-[0_26px_60px_rgba(42,110,149,.16)] sm:inset-7" aria-hidden="true" />
          <div className="absolute inset-0 overflow-hidden rounded-[34px] border border-[#b9e2f5] bg-gradient-to-br from-[#dff4ff] via-[#a7dcf7] to-[#72bce6] p-5 sm:p-8">
            <div className="absolute right-[-14%] top-[-18%] h-72 w-72 rounded-full border border-white/40" aria-hidden="true" />
            <div className="absolute right-[-6%] top-[-10%] h-96 w-96 rounded-full border border-white/25" aria-hidden="true" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#35728f]">
                  The Westin Skybook
                </span>
                <BookOpen size={19} className="text-[#35728f]" aria-hidden="true" />
              </div>
              <div className="relative mt-8 flex-1 rounded-[28px] border border-white/80 bg-[#f9fdff]/85 p-3 shadow-[0_20px_40px_rgba(42,110,149,.12)] sm:p-5">
                <div className="absolute left-[16%] top-5 h-1 w-24 rounded-full bg-[#f2a159] opacity-80" aria-hidden="true" />
                <div className="absolute bottom-0 left-[8%] h-[72%] w-[84%] text-[#397995] opacity-75">
                  <CampusIllustration className="h-full w-full" />
                </div>
                <div className="absolute bottom-7 left-[10%] h-2 w-[78%] rounded-full bg-[#3ba7f2]/20" aria-hidden="true" />
                <div className="absolute bottom-8 left-[11%] h-44 w-2 rotate-[28deg] rounded-full bg-[#3ba7f2]/75 shadow-[0_0_0_4px_rgba(59,167,242,.1)] sm:h-56" aria-hidden="true" />
                <div className="absolute right-[8%] top-[16%] rounded-xl border border-[#c8e4ee] bg-white/80 px-3 py-2 text-[10px] font-semibold text-[#42647a] shadow-sm">
                  Open a new page
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div className="rounded-xl border border-white/80 bg-[#fffaf0]/90 px-3 py-2 text-[10px] leading-5 text-[#78664a] shadow-sm">
                  Small first steps.<br /><strong className="text-[#493f30]">A wider future.</strong>
                </div>
                <div className="h-20 w-24 rounded-t-[50%] border-2 border-[#f2a159]/70 border-b-0 bg-[#f2a159]/25" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d9eaf3] bg-white/70" aria-labelledby="programs-heading">
        <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
            <div>
              <SectionLabel>Find your kind of future</SectionLabel>
              <h2 id="programs-heading" className="mt-5 max-w-md text-4xl font-bold tracking-[-0.05em] text-[#142d46] sm:text-5xl">
                Start with a direction.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#557184]">
                Compare the main pathways, then open the details that help you make a thoughtful choice.
              </p>
              <Link to="/programs" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#1468aa] hover:text-[#0f527f]">
                See all programs <ChevronRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Study pathways">
                {fixturePrograms.map((program) => (
                  <button
                    key={program.slug}
                    type="button"
                    role="tab"
                    aria-selected={selectedProgram.slug === program.slug}
                    onClick={() => setSelectedProgram(program)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${selectedProgram.slug === program.slug ? 'border-[#1468aa] bg-[#1468aa] text-white' : 'border-[#c9e1ed] bg-white text-[#42647a] hover:border-[#3ba7f2]'}`}
                  >
                    {program.label}
                  </button>
                ))}
              </div>
              <div className="mt-5 grid gap-6 rounded-[28px] border border-[#cce7f7] bg-[#eaf6ff] p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#35728f]">{selectedProgram.label}</span>
                  <h3 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#142d46]">{selectedProgram.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#42647a]">{selectedProgram.summary}</p>
                </div>
                <div className="rounded-2xl bg-white/75 p-5">
                  <p className="text-sm leading-7 text-[#42647a]">{selectedProgram.detail}</p>
                  <ul className="mt-5 grid gap-2 text-sm font-semibold text-[#325d77]">
                    {selectedProgram.facts.map((fact) => (
                      <li key={fact} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedProgram.color }} aria-hidden="true" />
                        {fact}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/programs/${selectedProgram.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1468aa]">
                    Open pathway <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24" aria-labelledby="learning-heading">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="grid grid-cols-2 gap-4">
            <PaperPhoto label="Business learning" tone="blue" />
            <div className="mt-12"><PaperPhoto label="Hospitality practice" tone="orange" /></div>
          </div>
          <div>
            <SectionLabel>Learn beyond the classroom</SectionLabel>
            <h2 id="learning-heading" className="mt-5 max-w-xl text-4xl font-bold tracking-[-0.05em] text-[#142d46] sm:text-5xl">
              Curiosity becomes useful when you practise it.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#557184]">
              The public story will pair approved learning experiences with clear details about how students learn, practise, and prepare.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {['People first', 'Practice matters', 'Keep moving'].map((item, index) => (
                <div key={item} className="border-l-2 border-[#a9ddfa] pl-4">
                  <span className="text-xs font-bold text-[#f2a159]">0{index + 1}</span>
                  <p className="mt-2 text-sm font-bold text-[#325d77]">{item}</p>
                </div>
              ))}
            </div>
            <Link to="/why-westin" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#1468aa]">
              Why Westin <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#142d46] text-white" aria-labelledby="journey-heading">
        <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <SectionLabel>From campus to career</SectionLabel>
              <h2 id="journey-heading" className="mt-5 max-w-md text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
                A path is made of useful next steps.
              </h2>
              <p className="mt-5 max-w-md text-base leading-8 text-[#c7dfed]">
                Approved guidance, dated outcomes, and real stories will make this chapter practical and credible.
              </p>
            </div>
            <ol className="grid gap-5">
              {[
                ['01', 'Prepare', 'Build the foundations, habits, and confidence to take on new work.'],
                ['02', 'Practise', 'Turn ideas into experience through projects, service, and teamwork.'],
                ['03', 'Move forward', 'Use guidance and reflection to choose the next opportunity with care.'],
              ].map(([number, title, copy]) => (
                <li key={number} className="grid grid-cols-[52px_1fr] gap-4 border-b border-white/15 pb-5 last:border-0">
                  <span className="text-sm font-bold text-[#f2a159]">{number}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-[#c7dfed]">{copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24" aria-labelledby="journal-heading">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <SectionLabel>Happening here</SectionLabel>
            <h2 id="journal-heading" className="mt-5 text-4xl font-bold tracking-[-0.05em] text-[#142d46] sm:text-5xl">
              A living campus journal.
            </h2>
          </div>
          <Link to="/news" className="inline-flex items-center gap-2 text-sm font-bold text-[#1468aa]">
            Browse stories <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {fixtureStories.map((story, index) => (
            <article key={story.id} className="rounded-[24px] border border-[#d4e8f2] bg-white p-5 shadow-[0_10px_30px_rgba(27,96,133,.06)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#35728f]">{story.eyebrow}</span>
                <span className="text-2xl text-[#f2a159]" aria-hidden="true">{index === 1 ? '↗' : '✦'}</span>
              </div>
              <h3 className="mt-8 text-2xl font-bold tracking-[-0.04em] text-[#142d46]">{story.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#557184]">{story.summary}</p>
              <Link to={story.kind === 'event' ? '/campus/events' : story.kind === 'publication' ? '/magazine' : '/news'} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1468aa]">
                Read the chapter <ChevronRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#d9eaf3] bg-[#eaf6ff]" aria-labelledby="closing-heading">
        <div className="mx-auto grid max-w-[1360px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12 lg:py-20">
          <div>
            <SectionLabel>Your next page</SectionLabel>
            <h2 id="closing-heading" className="mt-5 max-w-2xl text-4xl font-bold tracking-[-0.05em] text-[#142d46] sm:text-5xl">
              Ready to ask a good question?
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-[#42647a]">
              Explore a pathway, request a visit, or contact the college for current information.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link to="/admissions#visit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1468aa] px-5 text-sm font-bold text-white">
              Plan a campus visit <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#9fcce2] bg-white px-5 text-sm font-bold text-[#1468aa]">
              Contact Westin <Compass size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <div className="sr-only" aria-live="polite">
        <Sparkles aria-hidden="true" />
      </div>
    </div>
  )
}

function PublishedHome({ entries }: { entries: Array<{ id: string; entryType: string; slug: string; content: Record<string, unknown> }> }) {
  const sections = entries.filter((entry) => entry.entryType === 'homepage-section')
  if (!sections.length) {
    return (
      <section className="mx-auto max-w-[900px] px-5 py-24 text-center sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#35728f]">Westin Skybook</p>
        <h1 className="mt-5 text-4xl font-bold tracking-[-0.06em] text-[#142d46] sm:text-5xl">Published content is on its way.</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#557184]">The public API has no approved homepage revisions yet. The local preview remains available with fixture mode.</p>
      </section>
    )
  }
  return (
    <div>
      <section className="mx-auto max-w-[1360px] px-5 pb-16 pt-12 sm:px-8 lg:px-12 lg:pb-24 lg:pt-20">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#35728f]">Westin Skybook</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-bold tracking-[-0.07em] text-[#142d46] sm:text-7xl">{contentText(sections[0].content, 'title') || 'A new chapter starts here.'}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#42647a]">{contentText(sections[0].content, 'summary')}</p>
      </section>
      <section className="mx-auto grid max-w-[1360px] gap-5 px-5 pb-20 sm:px-8 md:grid-cols-2 lg:grid-cols-3 lg:px-12">
        {sections.slice(1).map((section) => (
          <article key={section.id} className="rounded-[24px] border border-[#cce7f7] bg-white p-6 shadow-[0_10px_30px_rgba(27,96,133,.06)]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#35728f]">{contentText(section.content, 'eyebrow')}</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-[#142d46]">{contentText(section.content, 'title')}</h2>
            <p className="mt-3 text-sm leading-7 text-[#557184]">{contentText(section.content, 'summary')}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

function contentText(content: Record<string, unknown>, key: string) {
  const value = content[key]
  return typeof value === 'string' ? value : ''
}
