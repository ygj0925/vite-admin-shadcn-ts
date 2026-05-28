import { useLocation } from 'react-router-dom'
import { PanelLeft } from 'lucide-react'
import { useAppStore } from '@/stores/app'
import { AppBreadcrumb } from './breadcrumb'
import { ThemeToggle } from './theme-toggle'
import { UserDropdown } from './user-dropdown'
import { MobileNav } from './mobile-nav'

export function AppHeader() {
  const toggleMenuCollapse = useAppStore((s) => s.toggleMenuCollapse)
  const location = useLocation()
  const isAppPage = location.pathname.startsWith('/app')

  return (
    <>
      <header className="flex h-12 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMenuCollapse}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent transition-colors duration-300"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <AppBreadcrumb />
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserDropdown />
        </div>
      </header>
      {isAppPage && <MobileNav />}
    </>
  )
}
