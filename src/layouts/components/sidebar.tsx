import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Home, MessageSquare, Calendar, Globe, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useAppStore } from '@/stores/app'
import { useRouteStore } from '@/stores/route'
import { useIsMobile } from '@/hooks/use-mobile'
import { SvgIcon } from '@/components/svg-icon'
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
  const isMobile = useIsMobile()
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen)
  const hasChildren = route.children && route.children.length > 0
  const isActive = location.pathname === route.path || location.pathname.startsWith(route.path + '/')

  // Flatten single-child routes
  if (hasChildren && route.children!.length === 1 && !route.meta?.alwaysShow) {
    const child = route.children![0]
    return <MenuItem route={{ ...child, path: `${route.path}/${child.path}` }} collapsed={collapsed} />
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    if (isMobile) setMobileSidebarOpen(false)
  }

  if (hasChildren) {
    return (
      <Collapsible defaultOpen={isActive}>
        <CollapsibleTrigger className={cn(
          'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-sidebar-foreground/70'
        )}>
          {route.meta?.icon && (
            <span className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center transition-colors duration-200',
              isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70'
            )}>
              <SvgIcon name={route.meta.icon} size={18} />
            </span>
          )}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{route.meta?.title}</span>
              <ChevronRight className={cn(
                'h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40 transition-transform duration-200',
                'group-data-[state=open]:rotate-90'
              )} />
            </>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-3 mt-0.5 space-y-0.5 border-l border-sidebar-border/60 pl-3">
          {route.children!.map((child) => (
            <MenuItem key={child.path} route={{ ...child, path: `${route.path}/${child.path}` }} collapsed={collapsed} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const item = (
    <button
      onClick={() => handleNavigate(route.path)}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        location.pathname === route.path
          ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm shadow-sidebar-primary/20'
          : 'text-sidebar-foreground/70'
      )}
    >
      {route.meta?.icon && (
        <span className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center transition-colors duration-200',
          location.pathname === route.path
            ? 'text-sidebar-primary-foreground'
            : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70'
        )}>
          <SvgIcon name={route.meta.icon} size={18} />
        </span>
      )}
      {!collapsed && <span className="truncate">{route.meta?.title}</span>}
    </button>
  )

  if (collapsed && !isMobile) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{item}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>{route.meta?.title}</TooltipContent>
      </Tooltip>
    )
  }

  return item
}

/** 侧边栏导航内容（桌面端和移动端共用） */
function SidebarNavContent() {
  const menuCollapse = useAppStore((s) => s.menuCollapse)
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)
  const isMobile = useIsMobile()

  const visibleRoutes = useMemo(
    () => dynamicRoutes.filter((r) => !r.meta?.hidden),
    [dynamicRoutes]
  )

  const location = useLocation()
  const navigate = useNavigate()
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen)
  const isAppPage = location.pathname.startsWith('/app')

  const collapsed = !isMobile && menuCollapse

  const handleAppNav = (path: string) => {
    navigate(path)
    if (isMobile) setMobileSidebarOpen(false)
  }

  return (
    <ScrollArea className="flex-1 px-3">
      <nav className="space-y-1 py-3">
        {visibleRoutes.map((route) => (
          <MenuItem key={route.path} route={route} collapsed={collapsed} />
        ))}

        {/* 应用中心 section */}
        {!collapsed && (
          <div className="mt-6">
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              应用中心
            </div>
            <div className="space-y-1">
              {appNavItems.map((item) => {
                const active = isAppPage && location.pathname.startsWith(item.path)
                return (
                  <button
                    key={item.path}
                    onClick={() => handleAppNav(item.path)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      active
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm shadow-sidebar-primary/20'
                        : 'text-sidebar-foreground/70'
                    )}
                  >
                    <span className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center transition-colors duration-200',
                      active
                        ? 'text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70'
                    )}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Collapsed app nav (desktop only) */}
        {collapsed && (
          <div className="mt-6 space-y-1">
            {appNavItems.map((item) => {
              const active = isAppPage && location.pathname.startsWith(item.path)
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleAppNav(item.path)}
                      className={cn(
                        'group flex w-full items-center justify-center rounded-lg p-2.5 transition-all duration-200',
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        active
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-sidebar-primary/20'
                          : 'text-sidebar-foreground/70'
                      )}
                    >
                      {item.icon}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>{item.label}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        )}
      </nav>
    </ScrollArea>
  )
}

/** 桌面端侧边栏 */
function DesktopSidebar({ className }: SidebarProps) {
  return (
    <aside className={cn(
      'hidden md:flex h-full flex-col border-r border-sidebar-border bg-sidebar',
      'transition-all duration-300 ease-in-out',
      className
    )}>
      <Logo collapsed={useAppStore((s) => s.menuCollapse)} />
      <SidebarNavContent />
    </aside>
  )
}

/** 移动端侧边栏（Sheet 抽屉） */
function MobileSidebar() {
  const open = useAppStore((s) => s.mobileSidebarOpen)
  const setOpen = useAppStore((s) => s.setMobileSidebarOpen)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" showCloseButton={false} className="w-72 p-0 border-sidebar-border bg-sidebar">
        <Logo collapsed={false} />
        <SidebarNavContent />
      </SheetContent>
    </Sheet>
  )
}

/** 导出的 AppSidebar 同时渲染桌面端和移动端版本 */
export function AppSidebar({ className }: SidebarProps) {
  return (
    <>
      <DesktopSidebar className={className} />
      <MobileSidebar />
    </>
  )
}
