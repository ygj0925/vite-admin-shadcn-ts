import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Home, MessageSquare, Calendar, Globe, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useAppStore } from '@/stores/app'
import { useRouteStore } from '@/stores/route'
import { Logo } from './logo'
import type { RouteItem } from '@/types/api'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
}

const appNavItems: NavItem[] = [
  { path: '/app/home', label: '首页', icon: <Home className="h-4 w-4" /> },
  { path: '/app/ai-chat', label: 'AI', icon: <MessageSquare className="h-4 w-4" /> },
  { path: '/app/schedule', label: '日程', icon: <Calendar className="h-4 w-4" /> },
  { path: '/app/info', label: '资讯', icon: <Globe className="h-4 w-4" /> },
  { path: '/app/profile', label: '我的', icon: <User className="h-4 w-4" /> },
]

interface SidebarProps {
  className?: string
}

function MenuItem({ route, collapsed }: { route: RouteItem; collapsed: boolean }) {
  const location = useLocation()
  const navigate = useNavigate()
  const hasChildren = route.children && route.children.length > 0
  const isActive = location.pathname === route.path || location.pathname.startsWith(route.path + '/')

  // Flatten single-child routes
  if (hasChildren && route.children!.length === 1 && !route.meta?.alwaysShow) {
    const child = route.children![0]
    return <MenuItem route={{ ...child, path: `${route.path}/${child.path}` }} collapsed={collapsed} />
  }

  if (hasChildren) {
    return (
      <Collapsible defaultOpen={isActive}>
        <CollapsibleTrigger className={cn(
          'flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors duration-300',
          'hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-accent text-accent-foreground font-medium'
        )}>
          {route.meta?.icon && <span className="h-4 w-4 shrink-0">{route.meta.icon}</span>}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{route.meta?.title}</span>
              <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
            </>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-4 space-y-0.5">
          {route.children!.map((child) => (
            <MenuItem key={child.path} route={{ ...child, path: `${route.path}/${child.path}` }} collapsed={collapsed} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const item = (
    <button
      onClick={() => navigate(route.path)}
      className={cn(
        'flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors duration-300',
        'hover:bg-accent hover:text-accent-foreground',
        location.pathname === route.path && 'bg-primary text-primary-foreground'
      )}
    >
      {route.meta?.icon && <span className="h-4 w-4 shrink-0">{route.meta.icon}</span>}
      {!collapsed && <span className="truncate">{route.meta?.title}</span>}
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{item}</TooltipTrigger>
        <TooltipContent side="right">{route.meta?.title}</TooltipContent>
      </Tooltip>
    )
  }

  return item
}

export function AppSidebar({ className }: SidebarProps) {
  const menuCollapse = useAppStore((s) => s.menuCollapse)
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)

  const visibleRoutes = useMemo(
    () => dynamicRoutes.filter((r) => !r.meta?.hidden),
    [dynamicRoutes]
  )

  const location = useLocation()
  const navigate = useNavigate()
  const isAppPage = location.pathname.startsWith('/app')

  return (
    <aside className={cn('flex h-full flex-col border-r bg-background', className)}>
      <Logo collapsed={menuCollapse} />
      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-0.5 py-2">
          {visibleRoutes.map((route) => (
            <MenuItem key={route.path} route={route} collapsed={menuCollapse} />
          ))}

          {/* 应用中心 section */}
          {!menuCollapse && (
            <div className="mt-4">
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
                应用中心
              </div>
              <div className="space-y-0.5">
                {appNavItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors duration-300',
                      'hover:bg-accent hover:text-accent-foreground',
                      isAppPage && location.pathname.startsWith(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : ''
                    )}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Collapsed app nav */}
          {menuCollapse && (
            <div className="mt-4 space-y-0.5">
              {appNavItems.map((item) => (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate(item.path)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors duration-300',
                        'hover:bg-accent hover:text-accent-foreground',
                        isAppPage && location.pathname.startsWith(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : ''
                      )}
                    >
                      {item.icon}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </nav>
      </ScrollArea>
    </aside>
  )
}
