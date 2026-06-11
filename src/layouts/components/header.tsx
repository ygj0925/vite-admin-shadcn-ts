import { useMessageCount } from '@/hooks/use-message-count'
import { ThemeToggle } from './theme-toggle'
import { MessagePopover } from './message-popover'
import { HeaderSearch } from './header-search'

/**
 * 顶部导航 (参考 wuji_digital_portal navy 风格)
 * 布局：搜索框居中 (max-w-xl) + 操作区右
 */
export function AppHeader() {
  const { unreadCount, refresh } = useMessageCount()

  return (
    <div className="flex h-full w-full items-center gap-3">
      {/* 全局搜索 - 居中 */}
      <div className="flex-1 max-w-xl mx-auto">
        <HeaderSearch />
      </div>

      {/* 右侧操作 */}
      <div className="flex items-center gap-1 shrink-0">
        <MessagePopover unreadCount={unreadCount} onRead={refresh} />
        <ThemeToggle />
      </div>
    </div>
  )
}
