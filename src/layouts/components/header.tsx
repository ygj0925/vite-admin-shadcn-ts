import { useLocation } from 'react-router-dom'
import { PanelLeft, Menu } from 'lucide-react'
import { useAppStore } from '@/stores/app'
import { useIsMobile } from '@/hooks/use-mobile'
import { useMessageCount } from '@/hooks/use-message-count'
import { AppBreadcrumb } from './breadcrumb'
import { ThemeToggle } from './theme-toggle'
import { UserDropdown } from './user-dropdown'
import { MobileNav } from './mobile-nav'
import { MessagePopover } from './message-popover'
import { HeaderSearch } from './header-search'

export function AppHeader() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const isAppPage = location.pathname.startsWith('/app')
  const { unreadCount, refresh } = useMessageCount()

  // 桌面端：折叠侧边栏
  const toggleMenuCollapse = useAppStore((s) => s.toggleMenuCollapse)
  // 移动端：打开侧边栏 Sheet
  const toggleMobileSidebar = useAppStore((s) => s.toggleMobileSidebar)

  const handleToggle = () => {
    if (isMobile) {
      toggleMobileSidebar()
    } else {
      toggleMenuCollapse()
    }
  }

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-4 md:px-5 glass">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={handleToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
          >
            {isMobile ? <Menu className="h-5 w-5" /> : <PanelLeft className="h-4 w-4" />}
          </button>
          {/* 面包屑：移动端隐藏 */}
          <div className="hidden md:block">
            <AppBreadcrumb />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <HeaderSearch />
          <MessagePopover unreadCount={unreadCount} onRead={refresh} />
          <ThemeToggle />
          <div className="mx-1.5 h-5 w-px bg-border/60" />
          <UserDropdown />
        </div>
      </header>
      {isAppPage && <MobileNav />}
    </>
  )
}
