export type PublicPageKind =
  | 'about'
  | 'partners'
  | 'why-westin'
  | 'programs'
  | 'campus'
  | 'placements'
  | 'news'
  | 'blog'
  | 'campus-events'
  | 'gallery'
  | 'magazine'
  | 'testimonials'
  | 'success-stories'
  | 'admissions'
  | 'contact'

export interface PublicProgram {
  slug: string
  label: string
  title: string
  summary: string
  detail: string
  color: string
  facts: string[]
}

export interface PublicStory {
  id: string
  eyebrow: string
  title: string
  summary: string
  date?: string
  kind: 'news' | 'event' | 'publication'
}

/**
 * Local fixture content for the public-site preview. It intentionally avoids
 * current claims, rankings, fees, deadlines, placement numbers, or
 * unapproved testimonials. The API-backed public site will replace this
 * provider after content approval.
 */
export const fixturePrograms: PublicProgram[] = [
  {
    slug: 'bba',
    label: 'Business management',
    title: 'Build the confidence to lead.',
    summary: 'A business pathway for curious thinkers who want to understand people, decisions, and organisations.',
    detail: 'Explore management foundations, communication, practical projects, and the habits that help ideas move forward.',
    color: '#3BA7F2',
    facts: ['Three-year degree pathway', 'Business foundations', 'Practical learning'],
  },
  {
    slug: 'hotel-management',
    label: 'Hotel management',
    title: 'Learn where every detail matters.',
    summary: 'A hospitality pathway that brings service, operations, teamwork, and professional practice together.',
    detail: 'Build a grounded understanding of guest experience, hotel operations, food service, and the people who make hospitality work.',
    color: '#F2A159',
    facts: ['Hospitality-focused study', 'Service and operations', 'Industry-aware learning'],
  },
  {
    slug: 'intermediate',
    label: 'Intermediate',
    title: 'Choose a strong next step.',
    summary: 'MEC and CEC pathways for students building the academic foundation for future study.',
    detail: 'Compare approved streams and discover how a thoughtful start can open more than one direction.',
    color: '#67C7A1',
    facts: ['MEC and CEC streams', 'Two-year pathway', 'Progression planning'],
  },
]

export const fixtureStories: PublicStory[] = [
  {
    id: 'learning-in-practice',
    eyebrow: 'Learning in practice',
    title: 'A classroom can open into a much bigger world.',
    summary: 'The public story template is ready for approved learning, campus-life, and industry-exposure content.',
    kind: 'news',
  },
  {
    id: 'campus-journal',
    eyebrow: 'Campus journal',
    title: 'The moments between classes matter too.',
    summary: 'A place for approved campus stories, student activities, and the people who make Westin feel welcoming.',
    kind: 'event',
  },
  {
    id: 'westin-shelf',
    eyebrow: 'The Westin shelf',
    title: 'Keep a record of the ideas worth carrying forward.',
    summary: 'Publication covers, dates, and accessible download details will live here after editorial approval.',
    kind: 'publication',
  },
]

export const publicPageCopy: Record<PublicPageKind, { eyebrow: string; title: string; summary: string }> = {
  about: {
    eyebrow: 'About Westin',
    title: 'A college for the next chapter.',
    summary: 'Learn about the college, its people, its values, and the experience it is building for students.',
  },
  partners: {
    eyebrow: 'Partners and affiliations',
    title: 'The right relationships make a path stronger.',
    summary: 'Partnership and affiliation information will appear here after current wording is verified and approved.',
  },
  'why-westin': {
    eyebrow: 'Why Westin',
    title: 'A thoughtful start has room to grow.',
    summary: 'Explore the approved reasons students choose Westin, grounded in real learning and campus experience.',
  },
  programs: {
    eyebrow: 'Find your kind of future',
    title: 'Start with a direction, then make it yours.',
    summary: 'Compare business, hospitality, and intermediate pathways using clear, approved information.',
  },
  campus: {
    eyebrow: 'Campus life',
    title: 'A place to learn, practise, and belong.',
    summary: 'Explore the spaces, routines, and experiences that make a college day feel full.',
  },
  placements: {
    eyebrow: 'From campus to career',
    title: 'Preparation grows one useful step at a time.',
    summary: 'Understand career guidance, preparation, and approved outcomes without inflated promises.',
  },
  news: {
    eyebrow: 'Campus journal',
    title: 'What is happening at Westin.',
    summary: 'A searchable home for approved news, stories, and updates from the college.',
  },
  blog: {
    eyebrow: 'Westin journal',
    title: 'Ideas worth spending time with.',
    summary: 'A considered home for approved articles, reflections, and practical guidance.',
  },
  'campus-events': {
    eyebrow: 'Happening here',
    title: 'Make room for the moments that bring people together.',
    summary: 'Public event stories and dates will appear here after they are reviewed and published.',
  },
  gallery: {
    eyebrow: 'Gallery',
    title: 'See the details that make a place feel real.',
    summary: 'Approved campus and learning photography will be organised into accessible albums.',
  },
  magazine: {
    eyebrow: 'The Westin shelf',
    title: 'Ideas, people, and pages to return to.',
    summary: 'Find approved magazine editions and publication metadata in one calm, readable shelf.',
  },
  testimonials: {
    eyebrow: 'Student and alumni voices',
    title: 'Real stories, shared with permission.',
    summary: 'Consent-backed experiences will appear here with dates and context.',
  },
  'success-stories': {
    eyebrow: 'Success stories',
    title: 'Progress has more than one shape.',
    summary: 'Approved, dated stories will show what people did next without promising the same outcome to everyone.',
  },
  admissions: {
    eyebrow: 'Your next page',
    title: 'Take the next step with clear information.',
    summary: 'Ask a question or request a campus visit. A request starts a conversation; it is not an admission or booking confirmation.',
  },
  contact: {
    eyebrow: 'Contact Westin',
    title: 'Let’s make the next step easier.',
    summary: 'Find verified contact information and a simple way to ask the college a question.',
  },
}

export function getFixturePage(pathname: string): { kind: PublicPageKind; program?: PublicProgram } | null {
  const clean = pathname.replace(/\/$/, '') || '/'
  if (clean === '/about' || clean.startsWith('/about/')) return { kind: 'about' }
  if (clean === '/partners' || clean.startsWith('/partners/')) return { kind: 'partners' }
  if (clean === '/why-westin') return { kind: 'why-westin' }
  if (clean === '/programs') return { kind: 'programs' }
  if (clean.startsWith('/programs/')) {
    const slug = clean.slice('/programs/'.length)
    const program = fixturePrograms.find((item) => item.slug === slug)
    return program ? { kind: 'programs', program } : null
  }
  if (clean === '/campus/events' || clean.startsWith('/campus/events/')) return { kind: 'campus-events' }
  if (clean === '/campus' || clean.startsWith('/campus/')) return { kind: 'campus' }
  if (clean === '/placements' || clean === '/career-planner') return { kind: 'placements' }
  if (clean === '/news' || clean.startsWith('/news/')) return { kind: 'news' }
  if (clean === '/blog' || clean.startsWith('/blog/')) return { kind: 'blog' }
  if (clean === '/gallery' || clean.startsWith('/gallery/')) return { kind: 'gallery' }
  if (clean === '/magazine') return { kind: 'magazine' }
  if (clean === '/testimonials' || clean.startsWith('/testimonials/')) return { kind: 'testimonials' }
  if (clean === '/success-stories' || clean.startsWith('/success-stories/')) return { kind: 'success-stories' }
  if (clean === '/admissions') return { kind: 'admissions' }
  if (clean === '/contact') return { kind: 'contact' }
  return null
}
