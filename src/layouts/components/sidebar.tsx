import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Home, MessageSquare, Calendar, Globe, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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

/** 判断路径是否激活 */
function isActivePath(currentPath: string, target: string): boolean {
  if (currentPath === target) return true
  return target !== '/' && currentPath.startsWith(`${target}/`)
}

/** 判断父菜单是否激活（有子菜单激活时父菜单也激活） */
function isParentActive(currentPath: string, route: RouteItem): boolean {
  if (isActivePath(currentPath, route.path)) return true
  return Boolean(route.children?.some((child) => isActivePath(currentPath, `${route.path}/${child.path}`)))
}

function MenuItem({ route }: { route: RouteItem }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { state } = useSidebar()
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen)
  const hasChildren = route.children && route.children.length > 0

  // Flatten single-child routes
  if (hasChildren && route.children!.length === 1 && !route.meta?.alwaysShow) {
    const child = route.children![0]
    return <MenuItem route={{ ...child, path: `${route.path}/${child.path}` }} />
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    if (isMobile) setMobileSidebarOpen(false)
  }

  const active = hasChildren
    ? isParentActive(location.pathname, route)
    : isActivePath(location.pathname, route.path)

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton isActive={active} tooltip={route.meta?.title} asChild>
          <button onClick={() => handleNavigate(route.path)}>
            {route.meta?.icon && (
              <SvgIcon name={route.meta.icon} className="size-4" />
            )}
            <span>{route.meta?.title}</span>
          </button>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible asChild defaultOpen={active}>
      <SidebarMenuItem>
        <SidebarMenuButton isActive={active} tooltip={route.meta?.title}>
          {route.meta?.icon && (
            <SvgIcon name={route.meta.icon} className="size-4" />
          )}
          <span>{route.meta?.title}</span>
        </SidebarMenuButton>
        <CollapsibleTrigger asChild>
          <SidebarMenuAction className="data-[state=open]:rotate-90">
            <ChevronRight />
            <span className="sr-only">展开</span>
          </SidebarMenuAction>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {route.children!.map((child) => {
              const childPath = `${route.path}/${child.path}`
              return (
                <SidebarMenuSubItem key={child.path}>
                  <SidebarMenuSubButton
                    isActive={isActivePath(location.pathname, childPath)}
                    onClick={() => handleNavigate(childPath)}
                  >
                    {child.meta?.icon && (
                      <SvgIcon name={child.meta.icon} className="size-4" />
                    )}
                    <span>{child.meta?.title}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

/** 侧边栏导航内容 */
function SidebarNavContent() {
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen)
  const isAppPage = location.pathname.startsWith('/app')

  const visibleRoutes = useMemo(
    () => dynamicRoutes.filter((r) => !r.meta?.hidden),
    [dynamicRoutes]
  )

  const handleAppNav = (path: string) => {
    navigate(path)
    if (isMobile) setMobileSidebarOpen(false)
  }

  return (
    <SidebarContent>
      {/* 主导航菜单 */}
      <SidebarGroup>
        <SidebarMenu>
          {visibleRoutes.map((route) => (
            <MenuItem key={route.path} route={route} />
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* 应用中心 */}
      <SidebarGroup className="mt-auto">
        <SidebarMenu>
          {appNavItems.map((item) => {
            const active = isAppPage && location.pathname.startsWith(item.path)
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.label}
                  onClick={() => handleAppNav(item.path)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  )
}

/** AppSidebar 组件 - 现代化样式 */
export function AppSidebar({ className, ...props }: SidebarProps & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="inset"
      className={cn(
        'md:flex',
        // 现代化边框和阴影
        'border-r border-border/50',
        className
      )}
      {...props}
    >
      <SidebarHeader className="border-b border-border/50">
        <Logo />
      </SidebarHeader>
      <SidebarNavContent />
      <SidebarFooter className="border-t border-border/50" />
    </Sidebar>
  )
}
