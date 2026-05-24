import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useRouteStore } from '@/stores/route'

export function AppBreadcrumb() {
  const location = useLocation()
  const flatRoutes = useRouteStore((s) => s.flatRoutes)

  const pathnames = location.pathname.split('/').filter(Boolean)
  const crumbs = pathnames.map((_, i) => {
    const path = '/' + pathnames.slice(0, i + 1).join('/')
    const route = flatRoutes.find((r) => r.path === path)
    return { path, title: route?.meta?.title || pathnames[i] }
  })

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors duration-300">
        <Home className="h-4 w-4" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {i === crumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.title}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground transition-colors duration-300">
              {crumb.title}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
