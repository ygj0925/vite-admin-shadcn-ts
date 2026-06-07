import { useLocation } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { useMessageCount } from '@/hooks/use-message-count'
import { AppBreadcrumb } from './breadcrumb'
import { ThemeToggle } from './theme-toggle'
import { MessagePopover } from './message-popover'
import { HeaderSearch } from './header-search'

export function AppHeader() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const { unreadCount, refresh } = useMessageCount()

  return (
    <div className="flex h-full w-full items-center justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
        {/* 面包屑：移动端隐藏 */}
        <div className="hidden md:block">
          <AppBreadcrumb />
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
        <HeaderSearch />
        <MessagePopover unreadCount={unreadCount} onRead={refresh} />
        <ThemeToggle />
      </div>
    </div>
  )
}
