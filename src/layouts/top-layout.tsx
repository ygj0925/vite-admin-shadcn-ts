import { Outlet } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app'
import { useRouteStore } from '@/stores/route'
import { TabsBar } from './components/tabs-bar'
import { ThemeToggle } from './components/theme-toggle'
import { UserDropdown } from './components/user-dropdown'

export function TopLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const tab = useAppStore((s) => s.tab)
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)

  const visibleRoutes = dynamicRoutes.filter((r) => !r.meta?.hidden)

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex h-12 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-6">
          <div className="flex h-8 items-center font-medium text-foreground">
            <span className="text-primary font-bold">C</span>ontiNew Admin
          </div>
          <nav className="flex items-center gap-1">
            {visibleRoutes.map((route) => (
              <button
                key={route.path}
                onClick={() => navigate(route.path)}
                className={cn(
                  'rounded px-3 py-1.5 text-sm transition-colors duration-300',
                  location.pathname.startsWith(route.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-muted-foreground'
                )}
              >
                {route.meta?.title}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserDropdown />
        </div>
      </header>
      {tab && <TabsBar />}
      <main className="flex-1 overflow-auto p-4">
        <Outlet />
      </main>
    </div>
  )
}
