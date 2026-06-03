import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppStore } from '@/stores/app'
import { AppSidebar } from './components/sidebar'
import { AppHeader } from './components/header'
import { TabsBar } from './components/tabs-bar'

export function DefaultLayout() {
  const menuCollapse = useAppStore((s) => s.menuCollapse)
  const tab = useAppStore((s) => s.tab)
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 桌面端固定侧边栏 */}
      {!isMobile && (
        <AppSidebar
          className={cn('transition-all duration-300', menuCollapse ? 'w-16' : 'w-56')}
        />
      )}

      {/* 移动端：抽屉式侧边栏 */}
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
