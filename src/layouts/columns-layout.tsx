import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app'
import { useRouteStore } from '@/stores/route'
import { useIsMobile } from '@/hooks/use-mobile'
import { AppSidebar } from './components/sidebar'
import { AppHeader } from './components/header'
import { TabsBar } from './components/tabs-bar'
import { SvgIcon } from '@/components/svg-icon'
import type { RouteItem } from '@/types/api'

function OneLevelMenu({ routes }: { routes: RouteItem[] }) {
  const visibleRoutes = routes.filter((r) => !r.meta?.hidden)

  return (
    <div className="hidden md:flex w-16 flex-col items-center border-r border-sidebar-border/60 bg-sidebar py-3 gap-1.5">
      {visibleRoutes.map((route) => (
        <button
          key={route.path}
          className="group flex flex-col items-center gap-1 rounded-lg p-2 text-xs transition-all duration-200 w-12 hover:bg-sidebar-accent"
          title={route.meta?.title}
        >
          <span className="flex h-5 w-5 items-center justify-center text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80 transition-colors duration-200">
            {route.meta?.icon ? <SvgIcon name={route.meta.icon} size={18} /> : route.meta?.title?.[0]}
          </span>
          <span className="truncate text-[10px] text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80 w-full text-center transition-colors duration-200">
            {route.meta?.title}
          </span>
        </button>
      ))}
    </div>
  )
}

export function ColumnsLayout() {
  const menuCollapse = useAppStore((s) => s.menuCollapse)
  const tab = useAppStore((s) => s.tab)
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)
  const isMobile = useIsMobile()
  const location = useLocation()
  const isAppPage = location.pathname.startsWith('/app')

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <OneLevelMenu routes={dynamicRoutes} />
      <AppSidebar className={cn(
        'transition-all duration-300 ease-in-out',
        isMobile ? 'w-0' : menuCollapse ? 'w-12' : 'w-52'
      )} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        {tab && !isMobile && <TabsBar />}
        <main className={cn(
          'flex-1 overflow-auto',
          isMobile && isAppPage ? 'pb-20' : ''
        )}>
          <div className={cn(
            'h-full',
            isMobile ? 'p-3' : 'p-5'
          )}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
