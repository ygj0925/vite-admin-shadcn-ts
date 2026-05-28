import { useEffect } from 'react'
import { useThemeStore } from '@/stores/app-theme'

export function useTheme() {
  const { theme, toggleTheme, setTheme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  return { theme, toggleTheme, setTheme }
}
