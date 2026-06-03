import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Home, MessageSquare, Calendar, Globe, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { SvgIcon } from '@/components/svg-icon'
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
  /** 强制以"展开"形态渲染（用于移动端抽屉），忽略 menuCollapse */
  forceExpanded?: boolean
  /** 点击菜单项后的回调（如关闭抽屉） */
  onNavigate?: () => void
}

// 把后端路由的相对/绝对 path 拼接成绝对路径
function joinPath(parent: string, child: string) {
  if (child.startsWith('/')) return child
  if (!parent) return '/' + child
  return parent.replace(/\/$/, '') + '/' + child
}

function RouteIcon({ name, fallback }: { name?: string; fallback?: string }) {
  if (name) return <SvgIcon name={name} size={16} />
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center text-[10px] font-medium opacity-60">
      {fallback?.[0] ?? '·'}
    </span>
  )
}

function MenuItem({
  route,
  basePath,
  collapsed,
  onNavigate,
}: {
  route: RouteItem
  basePath: string
  collapsed: boolean
  onNavigate?: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const fullPath = joinPath(basePath, route.path)
  const title = route.meta?.title || route.title || route.name || route.path
  const icon = route.meta?.icon
  const hasChildren = !!(route.children && route.children.length > 0)
  const isActive = location.pathname === fullPath || location.pathname.startsWith(fullPath + '/')

  // 单子节点自动展平（保持与 Vue 项目同样的体验）
  if (hasChildren && route.children!.length === 1 && !route.meta?.alwaysShow) {
    const onlyChild = route.children![0]
    return (
      <MenuItem
        route={{
          ...onlyChild,
          meta: {
            ...onlyChild.meta,
            title: onlyChild.meta?.title || title,
            icon: onlyChild.meta?.icon || icon,
          },
        }}
        basePath={fullPath}
        collapsed={collapsed}
        onNavigate={onNavigate}
      />
    )
  }

  if (hasChildren) {
    return (
      <Collapsible defaultOpen={isActive} className="group/collapsible">
        <CollapsibleTrigger
          className={cn(
            'flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors duration-200',
            'hover:bg-accent hover:text-accent-foreground',
            isActive && 'text-foreground font-medium'
          )}
        >
          <RouteIcon name={icon} fallback={title} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{title}</span>
              <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-3 mt-0.5 space-y-0.5 border-l border-border pl-2">
          {route.children!.map((child) => (
            <MenuItem
              key={child.id ?? child.path}
              route={child}
              basePath={fullPath}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const handleClick = () => {
    navigate(fullPath)
    onNavigate?.()
  }

  const item = (
    <button
      onClick={handleClick}
      className={cn(
        'flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors duration-200',
        'hover:bg-accent hover:text-accent-foreground',
        location.pathname === fullPath && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
      )}
    >
      <RouteIcon name={icon} fallback={title} />
      {!collapsed && <span className="truncate text-left">{title}</span>}
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{item}</TooltipTrigger>
        <TooltipContent side="right">{title}</TooltipContent>
      </Tooltip>
    )
  }

  return item
}

export function AppSidebar({ className, forceExpanded, onNavigate }: SidebarProps) {
  const menuCollapseStore = useAppStore((s) => s.menuCollapse)
  const collapsed = forceExpanded ? false : menuCollapseStore
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)

  const visibleRoutes = useMemo(
    () => dynamicRoutes.filter((r) => !r.meta?.hidden),
    [dynamicRoutes]
  )

  const location = useLocation()
  const navigate = useNavigate()
  const isAppPage = location.pathname.startsWith('/app')

  const handleAppNav = (path: string) => {
    navigate(path)
    onNavigate?.()
  }

  return (
    <aside className={cn('flex h-full flex-col border-r bg-background', className)}>
      <Logo collapsed={collapsed} />
      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-0.5 py-2">
          {visibleRoutes.map((route) => (
            <MenuItem
              key={route.id ?? route.path}
              route={route}
              basePath=""
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}

          {/* 应用中心 section */}
          {!collapsed && (
            <div className="mt-4">
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
                应用中心
              </div>
              <div className="space-y-0.5">
                {appNavItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleAppNav(item.path)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors duration-200',
                      'hover:bg-accent hover:text-accent-foreground',
                      isAppPage && location.pathname.startsWith(item.path)
                        ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
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
          {collapsed && (
            <div className="mt-4 space-y-0.5">
              {appNavItems.map((item) => (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleAppNav(item.path)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors duration-200',
                        'hover:bg-accent hover:text-accent-foreground',
                        isAppPage && location.pathname.startsWith(item.path)
                          ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
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
