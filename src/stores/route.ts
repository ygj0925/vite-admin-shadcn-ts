import { create } from 'zustand'
import type { RouteItem } from '@/types/api'

// 清理旧版本残留的 localStorage 持久化数据
// 当前不再持久化 dynamicRoutes，每次刷新都会从后端重新拉取
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('continew-route')
  } catch {
    // ignore
  }
}

interface RouteState {
  dynamicRoutes: RouteItem[]
  flatRoutes: RouteItem[]
  /** path → RouteItem 索引，避免每次 find 全表线性查找 */
  flatRouteMap: Record<string, RouteItem>
  firstRoutePath: string
  setDynamicRoutes: (routes: RouteItem[]) => void
  setFlatRoutes: (routes: RouteItem[]) => void
}

// 后端返回的路由字段是扁平的（title/icon/isHidden/isCache/...），
// 前端组件统一从 route.meta 读取，这里把扁平字段映射到 meta 上。
function normalizeRoute(route: RouteItem, parentPath?: string): RouteItem {
  // 子菜单（有 permission 的按钮级菜单）需要标记父菜单路径，用于高亮父菜单 tab
  const activeMenu = route.parentId && route.type === 2 && route.permission
    ? parentPath
    : route.meta?.activeMenu

  const meta = {
    title: route.meta?.title ?? route.title ?? '',
    icon: route.meta?.icon ?? route.icon,
    hidden: route.meta?.hidden ?? route.isHidden ?? false,
    cache: route.meta?.cache ?? route.isCache ?? false,
    affix: route.meta?.affix ?? false,
    alwaysShow: route.meta?.alwaysShow ?? false,
    badge: route.meta?.badge,
    activeMenu,
  }

  // 按 sort 字段排序子路由
  const sortedChildren = route.children
    ? [...route.children].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map(c => normalizeRoute(c, route.path))
    : undefined

  return {
    ...route,
    meta,
    children: sortedChildren,
  }
}

/** 递归查找第一个可见的叶子路由路径 */
function findFirstRoutePath(routes: RouteItem[], parentPath = ''): string {
  for (const route of routes) {
    const isHidden = route.meta?.hidden ?? route.isHidden ?? false
    if (isHidden) continue
    if (route.isExternal) continue
    if (/^https?:\/\//.test(route.path)) continue

    const fullPath = route.path.startsWith('/')
      ? route.path
      : parentPath
        ? `${parentPath}/${route.path}`
        : `/${route.path}`

    // 如果有子路由，递归查找
    if (route.children && route.children.length > 0) {
      const childPath = findFirstRoutePath(route.children, fullPath)
      if (childPath) return childPath
    } else {
      return fullPath
    }
  }
  return ''
}

function flattenRoutes(routes: RouteItem[], parentPath = ''): RouteItem[] {
  const result: RouteItem[] = []
  for (const route of routes) {
    const fullPath = route.path.startsWith('/')
      ? route.path
      : parentPath
        ? `${parentPath}/${route.path}`
        : `/${route.path}`
    result.push({ ...route, path: fullPath })
    if (route.children) {
      result.push(...flattenRoutes(route.children, fullPath))
    }
  }
  return result
}

export const useRouteStore = create<RouteState>()((set) => ({
  dynamicRoutes: [],
  flatRoutes: [],
  flatRouteMap: {},
  firstRoutePath: '',

  setDynamicRoutes: (routes) => {
    // 顶级路由也按 sort 排序
    const sorted = [...routes].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    const normalized = sorted.map(r => normalizeRoute(r))
    const flat = flattenRoutes(normalized)
    const map: Record<string, RouteItem> = {}
    for (const r of flat) map[r.path] = r
    set({
      dynamicRoutes: normalized,
      flatRoutes: flat,
      flatRouteMap: map,
      firstRoutePath: findFirstRoutePath(normalized),
    })
  },

  setFlatRoutes: (routes) => {
    const map: Record<string, RouteItem> = {}
    for (const r of routes) map[r.path] = r
    set({ flatRoutes: routes, flatRouteMap: map })
  },
}))
