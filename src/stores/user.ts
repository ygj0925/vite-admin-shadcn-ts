import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { login as loginApi, logout as logoutApi, getUserInfo, getUserRoute } from '@/apis/auth'
import { setToken, removeToken } from '@/lib/auth'
import { useRouteStore } from '@/stores/route'
import type { UserInfo, RouteItem, LoginResp } from '@/types/api'

interface UserState {
  token: string | null
  userInfo: UserInfo | null
  roles: string[]
  permissions: string[]
  routes: RouteItem[]
  setToken: (token: string) => void
  setUserInfo: (info: UserInfo) => void
  setRoutes: (routes: RouteItem[]) => void
  login: (params: Record<string, unknown>) => Promise<LoginResp>
  logout: () => Promise<void>
  fetchUserInfo: () => Promise<UserInfo>
  fetchRoutes: () => Promise<RouteItem[]>
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      token: null,
      userInfo: null,
      roles: [],
      permissions: [],
      routes: [],

      setToken: (token) => {
        set({ token })
        setToken(token)
      },

      setUserInfo: (info) => {
        set({
          userInfo: info,
          roles: info.roles,
          permissions: info.permissions,
        })
      },

      setRoutes: (routes) => set({ routes }),

      login: async (params) => {
        const res = await loginApi(params as any)
        get().setToken(res.data.token)
        localStorage.setItem('continew-tenant-id', String(res.data.tenantId))
        return res.data
      },

      logout: async () => {
        try {
          await logoutApi()
        } finally {
          get().reset()
        }
      },

      fetchUserInfo: async () => {
        const res = await getUserInfo()
        get().setUserInfo(res.data)
        return res.data
      },

      fetchRoutes: async () => {
        const res = await getUserRoute()
        get().setRoutes(res.data)
        useRouteStore.getState().setDynamicRoutes(res.data)
        return res.data
      },

      reset: () => {
        removeToken()
        localStorage.removeItem('continew-tenant-id')
        useRouteStore.getState().setDynamicRoutes([])
        set({
          token: null,
          userInfo: null,
          roles: [],
          permissions: [],
          routes: [],
        })
      },
    }),
    {
      name: 'continew-user',
      partialize: (state) => ({
        token: state.token,
        userInfo: state.userInfo,
        roles: state.roles,
        permissions: state.permissions,
      }),
    }
  )
)
