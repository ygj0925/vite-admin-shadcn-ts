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
    <div className="flex h-screen flex-col overflow-hidden bg-muted/30">
      <NoticePopup />
      <header className="flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 md:px-5 glass">
        <div className="flex items-center gap-3 md:gap-6">
          {/* 移动端：汉堡菜单（打开侧边栏 Sheet） */}
          {isMobile && (
            <button
              onClick={toggleMobileSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm shadow-primary/25">
              C
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">ContiNew</span>
          </div>
          {/* 桌面端：顶部导航 */}
          <div className="hidden md:block h-5 w-px bg-border/60" />
          <ScrollArea className="hidden md:block max-w-[60vw] whitespace-nowrap">
            <nav className="flex items-center gap-1">
              {visibleRoutes.map((route) => (
                <button
                  key={route.path}
                  onClick={() => navigate(route.path)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    location.pathname.startsWith(route.path)
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {route.meta?.title}
                </button>
              ))}
            </nav>
            <ScrollBar orientation="horizontal" className="h-0" />
          </ScrollArea>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="mx-1.5 h-5 w-px bg-border/60" />
          <UserDropdown />
        </div>
      </header>
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
      {isAppPage && <MobileNav />}
    </div>
  )
}
