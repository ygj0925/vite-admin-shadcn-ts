import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LayoutMode = 'default' | 'mix' | 'columns' | 'top'
export type ThemeMode = 'light' | 'dark'
export type TabMode = 'line' | 'card' | 'capsule'
export type AnimateMode = 'fade' | 'slide' | 'zoom' | 'none'

interface AppState {
  layout: LayoutMode
  theme: ThemeMode
  menuCollapse: boolean
  menuDark: boolean
  tab: boolean
  tabMode: TabMode
  animateMode: AnimateMode
  themeColor: string
  menuAccordion: boolean
  mobileSidebarOpen: boolean
  setLayout: (layout: LayoutMode) => void
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  setMenuCollapse: (collapse: boolean) => void
  toggleMenuCollapse: () => void
  setMenuDark: (dark: boolean) => void
  setTab: (show: boolean) => void
  setTabMode: (mode: TabMode) => void
  setAnimateMode: (mode: AnimateMode) => void
  setThemeColor: (color: string) => void
  setMenuAccordion: (accordion: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  toggleMobileSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      layout: 'default',
      theme: 'light',
      menuCollapse: false,
      menuDark: false,
      tab: true,
      tabMode: 'line',
      animateMode: 'fade',
      themeColor: '#3E6AE1',
      menuAccordion: false,
      mobileSidebarOpen: false,

      setLayout: (layout) => set({ layout }),
      setTheme: (theme) => {
        // DOM 操作由 App.tsx 的 useEffect 统一管理（含过渡防抖），这里只更新 state
        set({ theme })
      },
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
      },
      setMenuCollapse: (menuCollapse) => set({ menuCollapse }),
      toggleMenuCollapse: () => set((s) => ({ menuCollapse: !s.menuCollapse })),
      setMenuDark: (menuDark) => set({ menuDark }),
      setTab: (tab) => set({ tab }),
      setTabMode: (tabMode) => set({ tabMode }),
      setAnimateMode: (animateMode) => set({ animateMode }),
      setThemeColor: (themeColor) => set({ themeColor }),
      setMenuAccordion: (menuAccordion) => set({ menuAccordion }),
      setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
      toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
    }),
    {
      name: 'continew-app',
    }
  )
)
