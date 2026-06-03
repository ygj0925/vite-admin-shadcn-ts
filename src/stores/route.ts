import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RouteItem } from '@/types/api'

interface RouteState {
  dynamicRoutes: RouteItem[]
  flatRoutes: RouteItem[]
  _hasHydrated: boolean
  setDynamicRoutes: (routes: RouteItem[]) => void
  setFlatRoutes: (routes: RouteItem[]) => void
}

// 后端返回的路由字段是扁平的（title/icon/isHidden/isCache/...），
// 前端组件统一从 route.meta 读取，这里把扁平字段映射到 meta 上。
function normalizeRoute(route: RouteItem): RouteItem {
  const meta = {
    title: route.meta?.title ?? route.title ?? '',
    icon: route.meta?.icon ?? route.icon,
    hidden: route.meta?.hidden ?? route.isHidden ?? false,
    cache: route.meta?.cache ?? route.isCache ?? false,
    affix: route.meta?.affix ?? false,
    alwaysShow: route.meta?.alwaysShow ?? false,
    badge: route.meta?.badge,
  }
  return {
    ...route,
    meta,
    children: route.children?.map(normalizeRoute),
  }
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

export const useRouteStore = create<RouteState>()(
  persist(
    (set) => ({
      dynamicRoutes: [],
      flatRoutes: [],
      _hasHydrated: false,

      setDynamicRoutes: (routes) => {
        const normalized = routes.map(normalizeRoute)
        set({
          dynamicRoutes: normalized,
          flatRoutes: flattenRoutes(normalized),
        })
      },

      setFlatRoutes: (routes) => set({ flatRoutes: routes }),
    }),
    {
      name: 'continew-route',
      partialize: (state) => ({
        dynamicRoutes: state.dynamicRoutes,
      }),
      onRehydrateStorage: () => (state) => {
        // 历史持久化的数据可能没有 meta 字段，重新归一化一次以保证菜单标题/图标存在
        if (state && state.dynamicRoutes?.length) {
          const normalized = state.dynamicRoutes.map(normalizeRoute)
          state.dynamicRoutes = normalized
          state.flatRoutes = flattenRoutes(normalized)
        }
        if (state) {
          state._hasHydrated = true
        }
      },
    }
  )
)
