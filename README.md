# Westin Student Portal

React 19 + Vite + Tailwind v4 application with the public **Westin Skybook**
homepage and a protected student portal. Student timetable, attendance, materials,
events and settings use the Westin API (`../westin-api`). The public homepage
supports an explicitly disclosed design-preview mode and published API content.

## Run

```bash
npm install
npm run dev        # http://localhost:5173 (proxies /api -> localhost:4000)
npm run build      # type-check + production build
npm run preview    # serve dist at http://localhost:4173
npm test           # Playwright, responsive and axe checks (fixture + API modes)
npm run ssr:smoke   # existing public SSR compatibility check, not a deployment
npm run lint
npm run capture:skybook  # save screenshots while the production preview is running
```

The default public design preview does not need the API. For real student
features or published public content, start `../westin-api` separately (see its
README). Install the browser once for tests: `npx playwright install chromium`.

## Skybook homepage

The approved [reference](../references/westin-skybook-hero.png) informs the full
homepage: open-book hero, three study pathways, practical learning, campus life,
career journey, belonging, journal, publications, closing invitation and footer.
The logo is official; generated imagery is visibly illustrative, not a record
of actual Westin facilities or students. Headings and actions are HTML.

- `src/public/PublicLayout.tsx` — scoped public shell, metadata, mobile dialog,
  navigation and footer. Navigation collapses below 1200px.
- `PublicHome.tsx` — one presentation tree in both content modes.
- `home-model.ts` — typed adaptation of the existing published-content contract.
- `SkybookHero`, `ProgramExplorer`, `HomeChapters` and `HomeMedia` — responsive,
  independently testable sections and graceful image failure handling.
- `skybook.css` / `useSkybookMotion.ts` — scoped typography/tokens, one 1100ms
  hero entrance per tab, short section entrances and reduced-motion support.
- `ContactHandoff.tsx` — `/contact` and `/admissions#visit` call/WhatsApp handoffs;
  no form, personal-data collection, automatic messages or booking confirmation.

### Content modes

`VITE_PUBLIC_CONTENT_MODE=fixture` (default) shows evergreen preview copy,
generated artwork and a footer disclosure, with `noindex,nofollow`. It does not
invent testimonials, dated news or magazine editions.

`VITE_PUBLIC_CONTENT_MODE=api npm run dev` uses `GET /api/public/site` through the
existing public client, without auth headers or private-session refreshes.
The same nine chapters render when content is empty, slow, failed or incomplete.
Journal loading/unavailability is explicit; empty dynamic modules offer useful
discovery links, not made-up records.

The existing payload is `{ settings, entries }`; no migrations or API changes:

| Published entry | Homepage mapping |
| --- | --- |
| `homepage-section`, slug `hero` or `home-hero` | Optional `title`, `summary`, `eyebrow`; artwork remains the approved Skybook composition |
| `homepage-section`, slugs `learning`, `campus`, `career` | Optional `title`, `summary`, first valid image |
| `program`, slugs `bba`, `hotel-management`, `intermediate` | Published `title`/`summary`/media mapped into the three study pathways; navigation labels stay stable |
| `testimonial` | Display only with nonempty `quote` and `name`; optional `context`/image |
| `news`, `event-story`, `blog` | Up to four published titles/summaries, dates when valid, collection links |
| `magazine` | Up to three actual published editions; download only with a valid published PDF |

Media accepts root-relative or HTTPS URLs, plain-text alt/captions and normalized
`focalX`/`focalY` in 0–1. Malformed/unsafe URLs are omitted. Keep hero titles around
35–55 characters, section titles under 80 and summaries under 240 for the intended
editorial rhythm; longer titles wrap and are covered by tests. Approved published
photos should not be mislabeled as AI-generated. Verify content/media rights in
the publishing workflow; the homepage does not substitute for that review.

Set `VITE_PUBLIC_SITE_ORIGIN` to the approved canonical origin before deployment.
Production SSR hosting, sitemap/robots policy and full legacy content parity are
separate remaining work; this rebuild does not deploy or change those contracts.

### Assets and verification

Masters, exact prompts, screenshots and measured results are in
[references/homepage-rebuild](../references/homepage-rebuild/README.md).
`npm run assets:skybook` regenerates WebP derivatives from the nine named masters
using Sharp. It deliberately ignores screenshots. Desktop hero sources are
125–315 KiB; mobile sources are 29–100 KiB. Only the matching hero is prioritized;
below-fold imagery uses lazy loading and reserved dimensions. Inter and Bricolage
Grotesque are self-hosted, with license notices in `public/fonts`.

See the [verification report](../references/homepage-rebuild/verification.md) for
test coverage, actual Lighthouse measurements and remaining limitations.

## Demo login

| Identifier       | Email                       | Password       |
|------------------|-----------------------------|----------------|
| `STU-2025-001`   | balarakesh.g@university.edu | `Password@123` |

## User flow

```
Public homepage (/) → Student login (/login) → Dashboard (/dashboard)
                 ├── Timetable  (/timetable)
                 ├── Attendance (/attendance)
                 ├── Materials  (/materials)
                 ├── Events     (/events)
                 └── Settings   (/settings)

(/) remains public for signed-in students and shows Dashboard instead of
Student Login. Unknown public routes use the public not-found screen.
Protected routes redirect unauthenticated visitors to /login as before.
```

## Wiring

- `src/lib/api.ts` — fetch client (`apiFetch`, `useApi`) with Bearer access
  tokens, single-flight refresh-token rotation on 401, and session storage in
  `localStorage['student-portal.session']`.
- `src/contexts/AuthContext.tsx` — real login/logout against `/api/auth`.
- Pages fetch their own data: dashboard `/api/students/me/dashboard`,
  timetable `/api/timetable`, attendance `/api/attendance/my`,
  materials `/api/materials` (signed download URLs), events `/api/events`,
  settings `/api/settings`.
- `vite.config.ts` proxies `/api` to the backend in dev.
- `src/lib/onesignal.ts` loads the existing push SDK on its first private-portal
  call, not on public/login page load. It initializes once with the existing
  no-auto-prompt settings; identity, subscription and logout policies are retained.
  Live push delivery still requires the configured OneSignal origin and real
  authenticated-device testing; local tests use a stub and never send pushes.

## Notes

- Sky-blue + white visual identity (`#3BA7F2` primary), Inter typography.
- Fully responsive: fixed sidebar on desktop, slide-out drawer on mobile.
- Homepage work did not redesign login/dashboard screens or other public-page
  bodies. Backend and CMS are unchanged. Nothing has been deployed.
