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
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50',
      'border-t border-border/50',
      'bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60',
      'md:hidden safe-area-inset-bottom'
    )}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl',
                'transition-all duration-200 min-w-[56px]',
                'active:scale-95',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg',
                'transition-all duration-200',
                active ? 'bg-primary/10' : ''
              )}>
                <item.icon className={cn(
                  'h-5 w-5 transition-transform duration-200',
                  active ? 'scale-110' : ''
                )} />
              </div>
              <span className={cn(
                'text-[10px] leading-tight transition-colors duration-200',
                active ? 'font-semibold' : ''
              )}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
