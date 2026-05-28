import { useNavigate } from 'react-router-dom'
import {
  User,
  Bell,
  Star,
  BarChart3,
  Users,
  Shield,
  Menu,
  Settings,
  Moon,
  Sun,
  Info,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
} from 'lucide-react'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { usePermission } from '@/hooks/use-permission'
import { PageTransition } from '@/components/app/page-transition'
import { GlassCard } from '@/components/app/glass-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

const TESLA_BLUE = '#3E6AE1'

interface MenuItem {
  icon: React.ReactNode
  label: string
  path?: string
  color: string
}

const menuItems: MenuItem[] = [
  { icon: <User className="h-5 w-5 text-white" />, label: '我的信息', path: '/app/profile/settings', color: 'from-violet-600 to-blue-600' },
  { icon: <Bell className="h-5 w-5 text-white" />, label: '消息通知', color: 'from-rose-500 to-pink-500' },
  { icon: <Star className="h-5 w-5 text-white" />, label: '我的收藏', color: 'from-amber-500 to-orange-500' },
  { icon: <BarChart3 className="h-5 w-5 text-white" />, label: '使用统计', color: 'from-emerald-500 to-teal-500' },
]

const adminItems: MenuItem[] = [
  { icon: <Users className="h-5 w-5 text-white" />, label: '用户管理', path: '/system/user', color: 'from-blue-500 to-cyan-500' },
  { icon: <Shield className="h-5 w-5 text-white" />, label: '角色管理', path: '/system/role', color: 'from-purple-500 to-indigo-500' },
  { icon: <Menu className="h-5 w-5 text-white" />, label: '菜单管理', path: '/system/menu', color: 'from-teal-500 to-green-500' },
  { icon: <Settings className="h-5 w-5 text-white" />, label: '系统配置', path: '/system/config', color: 'from-slate-500 to-gray-500' },
]

export default function AppProfile() {
  const navigate = useNavigate()
  const userInfo = useUserStore((s) => s.userInfo)
  const logout = useUserStore((s) => s.logout)
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const { has } = usePermission()

  const nickname = userInfo?.nickname || userInfo?.username || '用户'
  const email = userInfo?.email || ''
  const phone = userInfo?.phone || ''

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <PageTransition className="p-4 md:p-6 space-y-6">
      {/* User info card */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="h-16 w-16">
            <AvatarImage src={userInfo?.avatar} alt={nickname} />
            <AvatarFallback
              className="text-xl font-semibold text-white"
              style={{ backgroundColor: TESLA_BLUE }}
            >
              {nickname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground">{nickname}</h2>
            <div className="mt-1 flex flex-col gap-1">
              {email && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Menu items */}
      <GlassCard>
        <div className="space-y-0">
          {menuItems.map((item, i) => (
            <div key={item.label}>
              <button
                onClick={() => item.path && navigate(item.path)}
                className="flex w-full items-center gap-3 py-3 text-sm transition-colors hover:bg-muted rounded-lg px-2 -mx-2"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.color}`}
                >
                  {item.icon}
                </div>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              {i < menuItems.length - 1 && <Separator className="my-0" />}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Admin section - only visible with admin permissions */}
      {has('system:user:list') && (
        <GlassCard title="管理">
          <div className="space-y-0">
            {adminItems.map((item, i) => (
              <div key={item.label}>
                <button
                  onClick={() => item.path && navigate(item.path)}
                  className="flex w-full items-center gap-3 py-3 text-sm transition-colors hover:bg-muted rounded-lg px-2 -mx-2"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.color}`}
                  >
                    {item.icon}
                  </div>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                {i < adminItems.length - 1 && <Separator className="my-0" />}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Theme toggle */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-gray-600">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-white" />
              ) : (
                <Sun className="h-5 w-5 text-white" />
              )}
            </div>
            <span className="text-sm font-medium">深色模式</span>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
          />
        </div>
      </GlassCard>

      {/* Bottom actions */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/app/profile/settings')}
          className="flex w-full items-center gap-3 rounded-2xl p-4 glass glass-dark dark:glass-dark light:glass-light border-white/10 dark:border-white/10 light:border-black/10 transition-colors hover:bg-muted"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
            <Info className="h-5 w-5 text-white" />
          </div>
          <span className="flex-1 text-left text-sm font-medium">关于</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl p-4 glass glass-dark dark:glass-dark light:glass-light border-white/10 dark:border-white/10 light:border-black/10 transition-colors hover:bg-destructive/10"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-500">
            <LogOut className="h-5 w-5 text-white" />
          </div>
          <span className="flex-1 text-left text-sm font-medium text-destructive">退出登录</span>
        </button>
      </div>
    </PageTransition>
  )
}
