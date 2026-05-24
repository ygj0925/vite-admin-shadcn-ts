import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app'
import { AppSidebar } from './components/sidebar'
import { AppHeader } from './components/header'
import { TabsBar } from './components/tabs-bar'

export function DefaultLayout() {
  const menuCollapse = useAppStore((s) => s.menuCollapse)
  const tab = useAppStore((s) => s.tab)

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar className={cn('transition-all duration-300', menuCollapse ? 'w-16' : 'w-56')} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        {tab && <TabsBar />}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
