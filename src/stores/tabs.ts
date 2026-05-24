import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RouteItem } from '@/types/api'

export interface TabItem {
  path: string
  title: string
  icon?: string
  affix?: boolean
  cache?: boolean
}

interface TabsState {
  openTabs: TabItem[]
  cacheList: string[]
  activeTab: string | null
  addTab: (tab: TabItem) => void
  removeTab: (path: string) => void
  closeOtherTabs: (path: string) => void
  closeLeftTabs: (path: string) => void
  closeRightTabs: (path: string) => void
  closeAllTabs: () => void
  setActiveTab: (path: string) => void
  addCache: (name: string) => void
  removeCache: (name: string) => void
  clearCache: () => void
  setTabsFromRoutes: (routes: RouteItem[]) => void
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      openTabs: [],
      cacheList: [],
      activeTab: null,

      addTab: (tab) => {
        const exists = get().openTabs.find((t) => t.path === tab.path)
        if (!exists) {
          set((s) => ({ openTabs: [...s.openTabs, tab] }))
        }
        if (tab.cache) {
          get().addCache(tab.path)
        }
        set({ activeTab: tab.path })
      },

      removeTab: (path) => {
        const tab = get().openTabs.find((t) => t.path === path)
        if (tab?.affix) return
        set((s) => ({
          openTabs: s.openTabs.filter((t) => t.path !== path),
          cacheList: s.cacheList.filter((c) => c !== path),
        }))
        // If removing active tab, switch to last remaining
        if (get().activeTab === path) {
          const remaining = get().openTabs
          set({ activeTab: remaining[remaining.length - 1]?.path || null })
        }
      },

      closeOtherTabs: (path) => {
        set((s) => ({
          openTabs: s.openTabs.filter((t) => t.path === path || t.affix),
          cacheList: s.cacheList.filter((c) => c === path),
          activeTab: path,
        }))
      },

      closeLeftTabs: (path) => {
        const idx = get().openTabs.findIndex((t) => t.path === path)
        set((s) => ({
          openTabs: s.openTabs.filter((t, i) => i >= idx || t.affix),
          activeTab: path,
        }))
      },

      closeRightTabs: (path) => {
        const idx = get().openTabs.findIndex((t) => t.path === path)
        set((s) => ({
          openTabs: s.openTabs.filter((t, i) => i <= idx || t.affix),
          activeTab: path,
        }))
      },

      closeAllTabs: () => {
        set((s) => ({
          openTabs: s.openTabs.filter((t) => t.affix),
          cacheList: s.openTabs.filter((t) => t.affix).map((t) => t.path),
          activeTab: s.openTabs.find((t) => t.affix)?.path || null,
        }))
      },

      setActiveTab: (path) => set({ activeTab: path }),

      addCache: (name) => {
        if (!get().cacheList.includes(name)) {
          set((s) => ({ cacheList: [...s.cacheList, name] }))
        }
      },

      removeCache: (name) => {
        set((s) => ({ cacheList: s.cacheList.filter((c) => c !== name) }))
      },

      clearCache: () => set({ cacheList: [] }),

      setTabsFromRoutes: (routes) => {
        const tabs: TabItem[] = []
        const collectAffixTabs = (items: RouteItem[]) => {
          for (const route of items) {
            if (route.meta?.affix) {
              tabs.push({
                path: route.path,
                title: route.meta.title,
                icon: route.meta.icon,
                affix: true,
                cache: route.meta.cache,
              })
            }
            if (route.children) collectAffixTabs(route.children)
          }
        }
        collectAffixTabs(routes)
        set({ openTabs: tabs })
      },
    }),
    {
      name: 'continew-tabs',
      partialize: (state) => ({
        openTabs: state.openTabs,
        cacheList: state.cacheList,
        activeTab: state.activeTab,
      }),
    }
  )
)
