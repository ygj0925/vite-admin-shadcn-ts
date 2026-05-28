import { useLocation, useNavigate } from 'react-router-dom'
import { Home, MessageSquare, Calendar, Globe, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/app/home', icon: Home, label: '首页' },
  { path: '/app/ai-chat', icon: MessageSquare, label: 'AI' },
  { path: '/app/schedule', icon: Calendar, label: '日程' },
  { path: '/app/info', icon: Globe, label: '资讯' },
  { path: '/app/profile', icon: User, label: '我的' },
]

export function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
