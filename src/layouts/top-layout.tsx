import { Outlet } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app'
import { useRouteStore } from '@/stores/route'
import { useIsMobile } from '@/hooks/use-mobile'
import { TabsBar } from './components/tabs-bar'
import { ThemeToggle } from './components/theme-toggle'
import { NoticePopup } from '@/views/user/message/components/notice-popup'
import { UserDropdown } from './components/user-dropdown'
import { MobileNav } from './components/mobile-nav'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export function TopLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const tab = useAppStore((s) => s.tab)
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)
  const isMobile = useIsMobile()
  const toggleMobileSidebar = useAppStore((s) => s.toggleMobileSidebar)

  const visibleRoutes = dynamicRoutes.filter((r) => !r.meta?.hidden)
  const isAppPage = location.pathname.startsWith('/app')

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <NoticePopup />

      {/* Header — refined glass */}
      <header className={cn(
        'app-header sticky top-0 z-40 flex h-14 items-center justify-between',
        'px-3 sm:px-4 md:px-5'
      )}>
        <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
          {/* 移动端：汉堡菜单 */}
          {isMobile && (
            <button
              onClick={toggleMobileSidebar}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                'text-muted-foreground transition-all duration-200',
                'hover:bg-accent hover:text-foreground press'
              )}
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="logo-mark flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold tracking-tight text-primary-foreground">
              C
            </div>
            <span className="text-sm sm:text-[15px] font-semibold tracking-tight text-foreground">ContiNew</span>
          </div>
          {/* 桌面端：顶部导航 */}
          <div className="hidden md:block h-5 w-px bg-border/60" />
          <ScrollArea className="hidden md:block max-w-[60vw] whitespace-nowrap">
            <nav className="flex items-center gap-0.5">
              {visibleRoutes.map((route) => {
                const active = location.pathname.startsWith(route.path)
                return (
                  <button
                    key={route.path}
                    onClick={() => navigate(route.path)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 press',
                      active
                        ? 'nav-pill-active'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    {route.meta?.title}
                  </button>
                )
              })}
            </nav>
            <ScrollBar orientation="horizontal" className="h-0" />
          </ScrollArea>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
          <ThemeToggle />
          <div className="mx-1 h-5 w-px bg-border/60 md:mx-1.5" />
          <UserDropdown />
        </div>
      </header>

      {/* Tabs Bar */}
      {tab && !isMobile && (
        <div className="app-tabsbar hidden md:block">
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

      {/* Mobile Navigation */}
      {isAppPage && <MobileNav />}
    </div>
  )
}
