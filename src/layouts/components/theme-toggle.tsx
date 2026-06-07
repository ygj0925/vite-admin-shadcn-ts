import { Moon, Sun } from 'lucide-react'
import { useAppStore } from '@/stores/app'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg',
        'text-muted-foreground transition-all duration-200',
        'hover:bg-accent hover:text-foreground',
        'active:scale-95'
      )}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 transition-transform duration-200" />
      ) : (
        <Sun className="h-4 w-4 transition-transform duration-200 rotate-0" />
      )}
    </button>
  )
}
