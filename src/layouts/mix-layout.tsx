import { Outlet } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useAppStore } from '@/stores/app'
import { useRouteStore } from '@/stores/route'
import { useIsMobile } from '@/hooks/use-mobile'
import { AppSidebar } from '@/components/app-sidebar'
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
    <SidebarProvider defaultOpen={!menuCollapse}>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <NoticePopup />

        {/* Header - 现代化玻璃效果 */}
        <header className={cn(
          'sticky top-0 z-40 flex h-14 items-center justify-between',
          'border-b border-border/50 bg-background/80 backdrop-blur-xl',
          'px-3 sm:px-4 md:px-5'
        )}>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
            {/* 移动端：汉堡菜单 */}
            {isMobile && (
              <button
                onClick={toggleMobileSidebar}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  'text-muted-foreground transition-all duration-200',
                  'hover:bg-accent hover:text-foreground active:scale-95'
                )}
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground shadow-md">
                C
              </div>
              <span className="text-sm sm:text-[15px] font-bold tracking-tight text-foreground">ContiNew</span>
            </div>
            {/* 一级导航：移动端隐藏，桌面端显示 */}
            <div className="hidden md:block h-5 w-px bg-border/50" />
            <ScrollArea className="hidden md:block max-w-96 whitespace-nowrap">
              <div className="flex items-center gap-1">
                {firstLevelRoutes.map((route) => {
                  const active = currentFirst?.path === route.path
                  return (
                    <button
                      key={route.path}
                      onClick={() => handleNavClick(route.path)}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200',
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {route.meta?.title}
                    </button>
                  )
                })}
              </div>
              <ScrollBar orientation="horizontal" className="h-0" />
            </ScrollArea>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            <ThemeToggle />
            <div className="mx-1 h-5 w-px bg-border/50 md:mx-1.5" />
            <UserDropdown />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {currentFirst?.children && currentFirst.children.length > 0 && (
            <AppSidebar />
          )}
          <SidebarInset className="flex flex-1 flex-col overflow-hidden bg-background">
            {/* Tabs Bar */}
            {tab && !isMobile && (
              <div className="hidden border-b border-border/50 bg-muted/20 md:block">
                <TabsBar />
              </div>
            )}

            {/* Main Content */}
            <main className={cn(
              'flex-1 overflow-auto',
              'bg-gradient-to-b from-muted/30 to-muted/50',
              'p-2 sm:p-3 md:p-4 lg:p-5',
              isMobile && isAppPage ? 'pb-20' : ''
            )}>
              <div className="mx-auto w-full max-w-7xl">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>

        {/* Mobile Navigation */}
        {isAppPage && <MobileNav />}
      </div>
    </SidebarProvider>
  )
}
