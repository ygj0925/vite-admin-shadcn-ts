"use client"

import * as React from "react"
import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { SvgIcon } from "@/components/svg-icon"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useRouteStore } from "@/stores/route"
import { useUserStore } from "@/stores/user"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)
  const userInfo = useUserStore((s) => s.userInfo)
  const location = useLocation()

  // 过滤可见路由并转换为导航格式
  const navItems = useMemo(() => {
    const visibleRoutes = dynamicRoutes.filter((r) => !r.meta?.hidden)
    return visibleRoutes.map((route) => {
      // 构建子菜单项
      const childItems = route.children
        ?.filter((child) => !child.meta?.hidden)
        .map((child) => {
          // 处理路径：避免重复拼接
          // 后端返回的 child.path 可能是：
          // 1. "user" (相对路径) - 需要拼接
          // 2. "/system/user" (完整路径) - 直接使用
          // 3. "system/user" (包含父路径但没有前导斜杠) - 需要加前导斜杠
          const childPath = child.path

          // 如果 child.path 已经是完整路径（以 / 开头），直接使用
          if (childPath.startsWith('/')) {
            return {
              title: child.meta?.title || child.title || "",
              url: childPath,
            }
          }

          // 如果 child.path 不以 / 开头，检查是否已经包含了父路径
          const parentPathWithoutSlash = route.path.startsWith('/') ? route.path.slice(1) : route.path
          if (childPath.startsWith(parentPathWithoutSlash + '/') || childPath === parentPathWithoutSlash) {
            // 已经包含了父路径，加上前导斜杠
            return {
              title: child.meta?.title || child.title || "",
              url: '/' + childPath,
            }
          }

          // 相对路径，拼接父路径
          return {
            title: child.meta?.title || child.title || "",
            url: route.path + '/' + childPath,
          }
        })

      return {
        title: route.meta?.title || route.title || "",
        url: route.path,
        icon: route.meta?.icon ? (
          <SvgIcon name={route.meta.icon} className="size-4" />
        ) : null,
        isActive: location.pathname.startsWith(route.path),
        items: childItems,
      }
    })
  }, [dynamicRoutes, location.pathname])

  // 用户数据
  const userData = useMemo(
    () => ({
      name: userInfo?.nickname || userInfo?.username || "用户",
      email: userInfo?.email || "",
      avatar: userInfo?.avatar || "",
    }),
    [userInfo]
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">ContiNew</span>
            <span className="truncate text-xs text-muted-foreground">
              Admin
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
