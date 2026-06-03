import { Outlet } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app'
import { useRouteStore } from '@/stores/route'
import { useIsMobile } from '@/hooks/use-mobile'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { AppSidebar } from './components/sidebar'
import { TabsBar } from './components/tabs-bar'
import { ThemeToggle } from './components/theme-toggle'
import { NoticePopup } from '@/views/user/message/components/notice-popup'
import { UserDropdown } from './components/user-dropdown'
import { MobileNav } from './components/mobile-nav'
import { Menu } from 'lucide-react'

export function MixLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const menuCollapse = useAppStore((s) => s.menuCollapse)
  const tab = useAppStore((s) => s.tab)
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)
  const isMobile = useIsMobile()
  const toggleMobileSidebar = useAppStore((s) => s.toggleMobileSidebar)
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen)

  const firstLevelRoutes = dynamicRoutes.filter((r) => !r.meta?.hidden)
  const currentFirst = firstLevelRoutes.find(
    (r) => location.pathname.startsWith(r.path)
  )
  const isAppPage = location.pathname.startsWith('/app')

  const handleNavClick = (path: string) => {
    navigate(path)
    if (isMobile) setMobileSidebarOpen(false)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/30">
      <NoticePopup />
      <div className="flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 md:px-5 glass">
        <div className="flex items-center gap-3 md:gap-5">
          {/* 移动端：汉堡菜单 */}
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
          {/* 一级导航：移动端隐藏，桌面端显示 */}
          <div className="hidden md:block h-5 w-px bg-border/60" />
          <ScrollArea className="hidden md:block max-w-96 whitespace-nowrap">
            <div className="flex items-center gap-1">
              {firstLevelRoutes.map((route) => (
                <button
                  key={route.path}
                  onClick={() => handleNavClick(route.path)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    currentFirst?.path === route.path
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {route.meta?.title}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-0" />
          </ScrollArea>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="mx-1.5 h-5 w-px bg-border/60" />
          <UserDropdown />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {currentFirst?.children && currentFirst.children.length > 0 && (
          <AppSidebar className={cn(
            'transition-all duration-300 ease-in-out',
            isMobile ? 'w-0' : menuCollapse ? 'w-[68px]' : 'w-60'
          )} />
        )}
        <div className="flex flex-1 flex-col overflow-hidden">
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
      {isAppPage && <MobileNav />}
    </div>
  )
}
