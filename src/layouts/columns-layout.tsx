import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/stores/app'
import { useRouteStore } from '@/stores/route'
import { useIsMobile } from '@/hooks/use-mobile'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from './components/header'
import { TabsBar } from './components/tabs-bar'
import { SvgIcon } from '@/components/svg-icon'
import { NoticePopup } from '@/views/user/message/components/notice-popup'
import type { RouteItem } from '@/types/api'

function OneLevelMenu({ routes }: { routes: RouteItem[] }) {
  const location = useLocation()
  const visibleRoutes = routes.filter((r) => !r.meta?.hidden)

  return (
    <div className={cn(
      'hidden md:flex w-16 flex-col items-center',
      'border-r border-border/50 bg-sidebar',
      'py-3 gap-1.5'
    )}>
      {visibleRoutes.map((route) => {
        const active = location.pathname.startsWith(route.path)
        return (
          <button
            key={route.path}
            className={cn(
              'group flex flex-col items-center gap-1 rounded-lg p-2 text-xs',
              'transition-all duration-200 w-12',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'hover:bg-sidebar-accent'
            )}
            title={route.meta?.title}
          >
            <span className={cn(
              'flex h-5 w-5 items-center justify-center transition-colors duration-200',
              active
                ? 'text-sidebar-primary'
                : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'
            )}>
              {route.meta?.icon ? <SvgIcon name={route.meta.icon} size={18} /> : route.meta?.title?.[0]}
            </span>
            <span className={cn(
              'truncate text-[10px] w-full text-center transition-colors duration-200',
              active
                ? 'text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'
            )}>
              {route.meta?.title}
            </span>
          </button>
        )
      })}
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
    <SidebarProvider defaultOpen={!menuCollapse}>
      <div className="flex h-screen overflow-hidden bg-background">
        <NoticePopup />
        <OneLevelMenu routes={dynamicRoutes} />
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col overflow-hidden bg-background">
          {/* Header - 现代化玻璃效果 */}
          <header className={cn(
            'sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2',
            'border-b border-border/50 bg-background/80 backdrop-blur-xl',
            'px-3 sm:px-4 md:px-5'
          )}>
            <SidebarTrigger className="-ml-1 hover:bg-accent" />
            <Separator orientation="vertical" className="mr-1 h-4" />
            <div className="min-w-0 flex-1 overflow-hidden">
              <AppHeader />
            </div>
          </header>

          {/* Tabs Bar */}
          {tab && !isMobile && (
            <div className="hidden border-b border-border/50 bg-muted/20 md:block">
              <TabsBar />
            </div>
          )}

          {/* Main Content */}
          <main className={cn(
            'flex-1 overflow-auto',
            'bg-muted/40',
            'p-2 sm:p-3 md:p-4 lg:p-5',
            isMobile && isAppPage ? 'pb-20' : ''
          )}>
            <div className="w-full">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
