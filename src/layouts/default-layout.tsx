import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app'
import { useIsMobile } from '@/hooks/use-mobile'
import { AppSidebar } from './components/sidebar'
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
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <NoticePopup />
      {/* 桌面端侧边栏（移动端由 sidebar 内部的 Sheet 控制） */}
      <AppSidebar className={cn(
        'transition-all duration-300 ease-in-out',
        isMobile ? 'w-0' : menuCollapse ? 'w-[68px]' : 'w-60'
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
