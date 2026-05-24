import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RouteItem } from '@/types/api'

interface RouteState {
  dynamicRoutes: RouteItem[]
  flatRoutes: RouteItem[]
  setDynamicRoutes: (routes: RouteItem[]) => void
  setFlatRoutes: (routes: RouteItem[]) => void
}

function flattenRoutes(routes: RouteItem[], parentPath = ''): RouteItem[] {
  const result: RouteItem[] = []
  for (const route of routes) {
    const fullPath = parentPath ? `${parentPath}/${route.path}` : route.path
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

      setDynamicRoutes: (routes) => {
        set({
          dynamicRoutes: routes,
          flatRoutes: flattenRoutes(routes),
        })
      },

      setFlatRoutes: (routes) => set({ flatRoutes: routes }),
    }),
    {
      name: 'continew-route',
      partialize: (state) => ({
        dynamicRoutes: state.dynamicRoutes,
      }),
    }
  )
)
