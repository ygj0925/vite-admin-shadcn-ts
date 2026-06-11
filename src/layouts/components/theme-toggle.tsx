import { Moon, Sun } from 'lucide-react'
import { useAppStore } from '@/stores/app'
import { cn } from '@/lib/utils'

/**
 * 主题切换按钮（navy header 风格）
 * 9×9 圆角图标按钮 + text-blue-200 hover:text-white hover:bg-white/10
 */
export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)

  return (
    <button
      onClick={toggleTheme}
      aria-label="切换主题"
      className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
        'text-blue-200 hover:text-white hover:bg-white/10'
      )}
    >
      {theme === 'light' ? (
        <Moon className="w-[18px] h-[18px]" />
      ) : (
        <Sun className="w-[18px] h-[18px]" />
      )}
    </button>
  )
}
