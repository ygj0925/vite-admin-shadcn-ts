import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/stores/app'
import { useIsMobile } from '@/hooks/use-mobile'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from './components/header'
import { TabsBar } from './components/tabs-bar'
import { NoticePopup } from '@/views/user/message/components/notice-popup'

export function DefaultLayout() {
  const menuCollapse = useAppStore((s) => s.menuCollapse)
  const tab = useAppStore((s) => s.tab)
  const isMobile = useIsMobile()
  const location = useLocation()
  const isAppPage = location.pathname.startsWith('/app')

  return (
    <SidebarProvider defaultOpen={!menuCollapse}>
      <AppSidebar />
      <SidebarInset className="flex h-svh min-w-0 flex-col overflow-hidden bg-background">
        <NoticePopup />

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

        {/* Tabs Bar - 仅桌面端显示 */}
        {tab && !isMobile && (
          <div className="hidden border-b border-border/50 bg-background/90 backdrop-blur-sm md:block">
            <TabsBar />
          </div>
        )}

        {/* Main Content - 响应式内边距 */}
        <main className={cn(
          'flex-1 overflow-auto',
          'bg-muted/40',
          // 响应式内边距
          'p-2 sm:p-3 md:p-4 lg:p-5',
          // 移动端底部导航空间
          isMobile && isAppPage ? 'pb-20' : ''
        )}>
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
