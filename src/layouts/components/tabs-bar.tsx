import { useLocation, useNavigate } from 'react-router-dom'
import { X, RotateCw, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTabsStore } from '@/stores/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export function TabsBar() {
  const location = useLocation()
  const navigate = useNavigate()
  // 拆 selector：仅订阅渲染需要的字段，actions 单独取（actions 引用稳定，不会引起重渲）
  const openTabs = useTabsStore((s) => s.openTabs)
  const activeTab = useTabsStore((s) => s.activeTab)
  const removeTab = useTabsStore((s) => s.removeTab)
  const closeOtherTabs = useTabsStore((s) => s.closeOtherTabs)
  const closeLeftTabs = useTabsStore((s) => s.closeLeftTabs)
  const closeRightTabs = useTabsStore((s) => s.closeRightTabs)
  const closeAllTabs = useTabsStore((s) => s.closeAllTabs)
  const setActiveTab = useTabsStore((s) => s.setActiveTab)

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
    navigate('/redirect' + location.pathname)
  }

  if (openTabs.length === 0) return null

  return (
    <div className="flex h-10 items-center bg-muted/20">
      <ScrollArea className="flex-1 whitespace-nowrap">
        <div className="flex items-center gap-1 px-2 sm:px-3">
          {openTabs.map((tab) => {
            const active = activeTab === tab.path
            return (
              <button
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                className={cn(
                  'group flex h-7 items-center gap-1.5 rounded-md px-2.5 sm:px-3 text-xs',
                  'transition-all duration-200',
                  active
                    ? 'bg-background text-foreground font-medium shadow-sm border border-border/50'
                    : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
                )}
              >
                <span className="max-w-20 sm:max-w-24 truncate">{tab.title}</span>
                {!tab.affix && (
                  <X
                    className="h-3 w-3 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:text-destructive"
                    onClick={(e) => handleClose(e, tab.path)}
                  />
                )}
              </button>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-0" />
      </ScrollArea>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground mx-1.5 sm:mx-2">
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
