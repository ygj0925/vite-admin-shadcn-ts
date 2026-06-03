import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppStore } from '@/stores/app'
import { useRouteStore } from '@/stores/route'
import { AppSidebar } from './components/sidebar'
import { TabsBar } from './components/tabs-bar'
import { ThemeToggle } from './components/theme-toggle'
import { UserDropdown } from './components/user-dropdown'

export function TopLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const tab = useAppStore((s) => s.tab)
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const visibleRoutes = dynamicRoutes.filter((r) => !r.meta?.hidden)

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex h-12 items-center justify-between border-b bg-background px-3 md:px-4">
        <div className="flex items-center gap-2 md:gap-6 min-w-0">
          {isMobile && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded hover:bg-accent transition-colors duration-200"
              aria-label="切换导航菜单"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
          <div className="flex h-8 items-center font-medium text-foreground shrink-0">
            <span className="text-primary font-bold">C</span>ontiNew Admin
          </div>
          {!isMobile && (
            <nav className="flex items-center gap-1 overflow-x-auto">
              {visibleRoutes.map((route) => (
                <button
                  key={route.path}
                  onClick={() => navigate(route.path)}
                  className={cn(
                    'rounded px-3 py-1.5 text-sm transition-colors duration-200 whitespace-nowrap',
                    location.pathname.startsWith(route.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent text-muted-foreground'
                  )}
                >
                  {route.meta?.title}
                </button>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserDropdown />
        </div>
      </header>

      {isMobile && (
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="left" className="w-64 p-0 [&>button]:hidden" showCloseButton={false}>
            <SheetTitle className="sr-only">导航菜单</SheetTitle>
            <AppSidebar forceExpanded onNavigate={() => setDrawerOpen(false)} className="w-full border-r-0" />
          </SheetContent>
        </Sheet>
      )}

      {tab && <TabsBar />}
      <main className="flex-1 overflow-auto p-4">
        <Outlet />
      </main>
    </div>
  )
}
