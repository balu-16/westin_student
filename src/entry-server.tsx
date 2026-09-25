import { renderToString } from 'react-dom/server'
import { Route, Routes, StaticRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PublicHome } from './public/PublicHome'
import { PublicLayout } from './public/PublicLayout'
import { NotFound, PublicPage, PublicSearch } from './public/PublicPage'

/** Minimal SSR entry used to prove the public route boundary.
 * The authenticated app remains client-rendered and is intentionally not
 * imported into this server entry. */
export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicHome />} />
            <Route path="/search" element={<PublicSearch />} />
            <Route path="*" element={<PublicRoute />} />
          </Route>
        </Routes>
      </AuthProvider>
    </StaticRouter>,
  )
}

function PublicRoute() {
  return <PublicPage />
}

export { NotFound }
