import { Outlet } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app'
import { useRouteStore } from '@/stores/route'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { AppSidebar } from './components/sidebar'
import { AppHeader } from './components/header'
import { TabsBar } from './components/tabs-bar'
import { UserDropdown } from './components/user-dropdown'
import { ThemeToggle } from './components/theme-toggle'

export function MixLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const menuCollapse = useAppStore((s) => s.menuCollapse)
  const tab = useAppStore((s) => s.tab)
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)

  const firstLevelRoutes = dynamicRoutes.filter((r) => !r.meta?.hidden)
  const currentFirst = firstLevelRoutes.find(
    (r) => location.pathname.startsWith(r.path)
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex h-12 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-4">
          <div className="flex h-8 items-center font-medium text-foreground">
            <span className="text-primary font-bold">C</span>ontiNew Admin
          </div>
          <ScrollArea className="max-w-96 whitespace-nowrap">
            <div className="flex items-center gap-1">
              {firstLevelRoutes.map((route) => (
                <button
                  key={route.path}
                  onClick={() => navigate(route.path)}
                  className={cn(
                    'rounded px-3 py-1.5 text-sm transition-colors duration-300',
                    currentFirst?.path === route.path
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent text-muted-foreground'
                  )}
                >
                  {route.meta?.title}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-0" />
          </ScrollArea>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserDropdown />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {currentFirst?.children && currentFirst.children.length > 0 && (
          <AppSidebar className={cn('transition-all duration-300', menuCollapse ? 'w-16' : 'w-56')} />
        )}
        <div className="flex flex-1 flex-col overflow-hidden">
          {tab && <TabsBar />}
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
