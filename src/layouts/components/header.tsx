import { PanelLeft, Menu } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppStore } from '@/stores/app'
import { AppBreadcrumb } from './breadcrumb'
import { ThemeToggle } from './theme-toggle'
import { UserDropdown } from './user-dropdown'

interface AppHeaderProps {
  /** 移动端点击汉堡按钮的回调；桌面端不传则使用全局折叠 */
  onMenuClick?: () => void
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const toggleMenuCollapse = useAppStore((s) => s.toggleMenuCollapse)
  const isMobile = useIsMobile()

  const handleClick = () => {
    if (isMobile && onMenuClick) {
      onMenuClick()
    } else {
      toggleMenuCollapse()
    }
  }

  return (
    <header className="flex h-12 items-center justify-between border-b bg-background px-3 md:px-4">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <button
          onClick={handleClick}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded hover:bg-accent transition-colors duration-200"
          aria-label="切换导航菜单"
        >
          {isMobile ? <Menu className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </button>
        {!isMobile && <AppBreadcrumb />}
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserDropdown />
      </div>
    </header>
  )
}
