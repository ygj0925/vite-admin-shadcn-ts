import { useLocation, useNavigate } from 'react-router-dom'
import { X, RotateCw, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTabsStore } from '@/stores/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export function TabsBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { openTabs, activeTab, removeTab, closeOtherTabs, closeLeftTabs, closeRightTabs, closeAllTabs, setActiveTab } = useTabsStore()

  const handleTabClick = (path: string) => {
    setActiveTab(path)
    navigate(path)
  }

  const handleClose = (e: React.MouseEvent, path: string) => {
    e.stopPropagation()
    removeTab(path)
    if (activeTab === path) {
      const remaining = openTabs.filter((t) => t.path !== path)
      if (remaining.length > 0) navigate(remaining[remaining.length - 1].path)
    }
  }

  const handleReload = () => {
    // Force re-render by navigating away and back
    navigate('/redirect' + location.pathname)
  }

  if (openTabs.length === 0) return null

  return (
    <div className="flex h-9 items-center border-b bg-background">
      <ScrollArea className="flex-1 whitespace-nowrap">
        <div className="flex items-center gap-0.5 px-2">
          {openTabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path)}
              className={cn(
                'flex h-7 items-center gap-1 rounded px-2.5 text-xs transition-colors duration-300',
                activeTab === tab.path
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-muted-foreground'
              )}
            >
              <span className="max-w-24 truncate">{tab.title}</span>
              {!tab.affix && (
                <X
                  className="h-3 w-3 shrink-0 hover:text-destructive"
                  onClick={(e) => handleClose(e, tab.path)}
                />
              )}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-0" />
      </ScrollArea>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent transition-colors duration-300 mx-1">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleReload}>
            <RotateCw className="h-4 w-4" /> 刷新当前
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => closeOtherTabs(activeTab || '')}>关闭其他</DropdownMenuItem>
          <DropdownMenuItem onClick={() => closeLeftTabs(activeTab || '')}>关闭左侧</DropdownMenuItem>
          <DropdownMenuItem onClick={() => closeRightTabs(activeTab || '')}>关闭右侧</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={closeAllTabs}>关闭全部</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
