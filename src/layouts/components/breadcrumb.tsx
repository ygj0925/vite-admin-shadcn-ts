import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useRouteStore } from '@/stores/route'
import { cn } from '@/lib/utils'

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
    <nav className="flex items-center gap-1 text-sm">
      <Link
        to="/"
        className={cn(
          'flex items-center gap-1 text-muted-foreground',
          'transition-colors duration-200 hover:text-foreground',
          'rounded-md p-1 hover:bg-accent'
        )}
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{crumb.title}</span>
          ) : (
            <Link
              to={crumb.path}
              className={cn(
                'text-muted-foreground',
                'transition-colors duration-200 hover:text-foreground',
                'rounded-md px-1 py-0.5 hover:bg-accent'
              )}
            >
              {crumb.title}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
