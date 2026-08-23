# Westin Student Portal

React 19 + Vite + Tailwind v4 SPA for students — timetable, attendance, study
materials, events and settings. **All data is live** from the Westin API
(`../westin-api`); the former mock data modules are gone.

## Run

```bash
npm install
npm run dev        # http://localhost:5173 (proxies /api -> localhost:4000)
npm run build      # type-check + production build
```

Start the API first: `cd ../westin-api && npm run dev` (see its README for
migrations + seed).

## Demo login

| Identifier       | Email                       | Password       |
|------------------|-----------------------------|----------------|
| `STU-2025-001`   | balarakesh.g@university.edu | `Password@123` |

## User flow

```
Login (/login) → Dashboard (/dashboard)
                 ├── Timetable  (/timetable)
                 ├── Attendance (/attendance)
                 ├── Materials  (/materials)
                 ├── Events     (/events)
                 └── Settings   (/settings)

(/) and unknown routes redirect to /login; authenticated visitors
are bounced straight to /dashboard. There is no public landing page.
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

## Notes

- Sky-blue + white visual identity (`#3BA7F2` primary), Inter typography.
- Fully responsive: fixed sidebar on desktop, slide-out drawer on mobile.
