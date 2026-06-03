import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppStore } from '@/stores/app'
import { useRouteStore } from '@/stores/route'
import { SvgIcon } from '@/components/svg-icon'
import { AppSidebar } from './components/sidebar'
import { AppHeader } from './components/header'
import { TabsBar } from './components/tabs-bar'
import type { RouteItem } from '@/types/api'

function OneLevelMenu({ routes }: { routes: RouteItem[] }) {
  const visibleRoutes = routes.filter((r) => !r.meta?.hidden)

  return (
    <div className="flex w-16 flex-col items-center border-r bg-background py-2 gap-1">
      {visibleRoutes.map((route) => (
        <button
          key={route.path}
          className="flex flex-col items-center gap-0.5 rounded p-2 text-xs hover:bg-accent transition-colors duration-200 w-14"
          title={route.meta?.title}
        >
          <span className="h-5 w-5 flex items-center justify-center text-muted-foreground">
            {route.meta?.icon ? <SvgIcon name={route.meta.icon} size={18} /> : route.meta?.title?.[0]}
          </span>
          <span className="truncate text-muted-foreground w-full text-center">{route.meta?.title}</span>
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
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {!isMobile && <OneLevelMenu routes={dynamicRoutes} />}
      {!isMobile && (
        <AppSidebar className={cn('transition-all duration-300', menuCollapse ? 'w-12' : 'w-48')} />
      )}

      {isMobile && (
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="left" className="w-64 p-0 [&>button]:hidden" showCloseButton={false}>
            <SheetTitle className="sr-only">导航菜单</SheetTitle>
            <AppSidebar forceExpanded onNavigate={() => setDrawerOpen(false)} className="w-full border-r-0" />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader onMenuClick={() => (isMobile ? setDrawerOpen(true) : undefined)} />
        {tab && <TabsBar />}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
