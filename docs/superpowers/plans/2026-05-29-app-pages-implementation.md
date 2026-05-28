# APP Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete set of APP pages with tech-fashionable design, dual-theme support, and responsive layout.

**Architecture:** Build on existing shadcn/ui components with custom glassmorphism effects, gradient colors, and animation system. Pages will be lazy-loaded and integrated with existing Zustand stores.

**Tech Stack:** React 19, TypeScript, Vite 8, shadcn/ui, Tailwind CSS v4, Lucide React, Zustand v5

---

## File Structure

### New Files to Create

```
src/
├── app/
│   └── app-router.tsx          # New router with APP routes
├── views/
│   ├── app/
│   │   ├── home/
│   │   │   └── index.tsx       # Home page (dashboard + app center)
│   │   ├── ai-chat/
│   │   │   ├── index.tsx       # AI chat page
│   │   │   ├── components/
│   │   │   │   ├── chat-list.tsx
│   │   │   │   ├── chat-window.tsx
│   │   │   │   ├── message-bubble.tsx
│   │   │   │   ├── role-selector.tsx
│   │   │   │   └── prompt-panel.tsx
│   │   ├── schedule/
│   │   │   ├── index.tsx       # Schedule page
│   │   │   ├── components/
│   │   │   │   ├── calendar-view.tsx
│   │   │   │   ├── week-view.tsx
│   │   │   │   ├── day-view.tsx
│   │   │   │   └── event-modal.tsx
│   │   ├── info/
│   │   │   ├── index.tsx       # Enterprise info page
│   │   │   ├── detail.tsx      # Article detail page
│   │   │   └── components/
│   │   │       ├── carousel.tsx
│   │   │       └── article-card.tsx
│   │   └── profile/
│   │       ├── index.tsx       # Profile page
│   │       └── settings.tsx    # Settings page
├── components/
│   └── app/
│       ├── glass-card.tsx      # Glassmorphism card component
│       ├── gradient-button.tsx # Gradient button component
│       ├── stat-card.tsx       # Statistics card component
│       ├── app-icon.tsx        # App icon component
│       └── page-transition.tsx # Page transition wrapper
├── hooks/
│   └── use-theme.ts            # Theme hook for dual-theme support
├── stores/
│   └── app-theme.ts            # Theme store
└── styles/
    └── animations.css          # Animation definitions
```

### Files to Modify

```
src/app/router.tsx              # Add new routes
src/index.css                   # Add custom CSS variables and animations
src/layouts/components/sidebar.tsx  # Update navigation items
src/layouts/components/header.tsx   # Update header for mobile
```

---

## Task 1: Setup Design System Foundation

**Files:**
- Create: `src/styles/animations.css`
- Create: `src/hooks/use-theme.ts`
- Create: `src/stores/app-theme.ts`
- Modify: `src/index.css`

- [ ] **Step 1: Create animation styles**

Create `src/styles/animations.css`:

```css
/* Page transitions */
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes page-exit {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Card animations */
@keyframes card-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Stagger animation for list items */
@keyframes stagger-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glow effect for borders */
@keyframes border-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(124, 58, 237, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.5);
  }
}

/* Floating animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Pulse animation */
@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* Utility classes */
.animate-page-enter {
  animation: page-enter 0.3s ease-out;
}

.animate-card-enter {
  animation: card-enter 0.3s ease-out;
}

.animate-stagger-enter {
  animation: stagger-enter 0.3s ease-out;
}

.animate-border-glow {
  animation: border-glow 2s ease-in-out infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Glassmorphism effects */
.glass {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.glass-dark {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-light {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Gradient utilities */
.gradient-primary {
  background: linear-gradient(135deg, #7c3aed, #3b82f6);
}

.gradient-secondary {
  background: linear-gradient(135deg, #a855f7, #06b6d4);
}

.gradient-accent {
  background: linear-gradient(135deg, #f97316, #ef4444);
}

/* Hover effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* Dark theme specific */
.dark .glass {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Light theme specific */
.light .glass {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
}
```

- [ ] **Step 2: Create theme store**

Create `src/stores/app-theme.ts`:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'continew-theme',
    }
  )
)
```

- [ ] **Step 3: Create theme hook**

Create `src/hooks/use-theme.ts`:

```typescript
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
```

- [ ] **Step 4: Update CSS variables**

Modify `src/index.css` to add new CSS variables for the APP design:

```css
/* Add after existing variables */
@layer base {
  :root {
    /* APP Design System Colors */
    --app-bg-dark: #0a0a0f;
    --app-bg-dark-secondary: #1a1a2e;
    --app-bg-light: #fafafa;
    --app-card-dark: #16171d;
    --app-card-light: #ffffff;
    --app-primary: #7c3aed;
    --app-secondary: #3b82f6;
    --app-accent-purple: #a855f7;
    --app-accent-blue: #06b6d4;
    --app-accent-orange: #f97316;
    --app-accent-red: #ef4444;
    --app-accent-green: #22c55e;
    --app-text-primary-dark: #ffffff;
    --app-text-secondary-dark: #a1a1aa;
    --app-text-primary-light: #18181b;
    --app-text-secondary-light: #71717a;
  }

  .dark {
    --app-bg: var(--app-bg-dark);
    --app-bg-secondary: var(--app-bg-dark-secondary);
    --app-card: var(--app-card-dark);
    --app-text-primary: var(--app-text-primary-dark);
    --app-text-secondary: var(--app-text-secondary-dark);
  }

  .light {
    --app-bg: var(--app-bg-light);
    --app-bg-secondary: #f5f5f5;
    --app-card: var(--app-card-light);
    --app-text-primary: var(--app-text-primary-light);
    --app-text-secondary: var(--app-text-secondary-light);
  }
}
```

- [ ] **Step 5: Import animation styles**

Add import to `src/index.css`:

```css
@import "../styles/animations.css";
```

- [ ] **Step 6: Commit**

```bash
git add src/styles/animations.css src/hooks/use-theme.ts src/stores/app-theme.ts src/index.css
git commit -m "feat: add design system foundation with theme support and animations"
```

---

## Task 2: Create Shared Components

**Files:**
- Create: `src/components/app/glass-card.tsx`
- Create: `src/components/app/gradient-button.tsx`
- Create: `src/components/app/stat-card.tsx`
- Create: `src/components/app/app-icon.tsx`
- Create: `src/components/app/page-transition.tsx`

- [ ] **Step 1: Create GlassCard component**

Create `src/components/app/glass-card.tsx`:

```tsx
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GlassCardProps {
  title?: string
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({
  title,
  children,
  className,
  hover = true,
}: GlassCardProps) {
  return (
    <Card
      className={cn(
        'glass glass-dark dark:glass-dark light:glass-light',
        'rounded-2xl border-white/10 dark:border-white/10 light:border-black/10',
        hover && 'hover-lift',
        'animate-card-enter',
        className
      )}
    >
      {title && (
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create GradientButton component**

Create `src/components/app/gradient-button.tsx`:

```tsx
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface GradientButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit'
}

export function GradientButton({
  children,
  onClick,
  disabled,
  loading,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
}: GradientButtonProps) {
  const variants = {
    primary: 'gradient-primary text-white hover:opacity-90',
    secondary:
      'glass glass-dark dark:glass-dark light:glass-light border-white/20 dark:border-white/20 light:border-black/20',
    ghost: 'bg-transparent hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/10',
  }

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'rounded-xl font-medium transition-all',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
```

- [ ] **Step 3: Create StatCard component**

Create `src/components/app/stat-card.tsx`:

```tsx
import { cn } from '@/lib/utils'
import { GlassCard } from './glass-card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  trend?: {
    value: string
    positive: boolean
  }
  icon: React.ReactNode
  iconColor?: string
  className?: string
}

export function StatCard({
  title,
  value,
  trend,
  icon,
  iconColor = 'from-violet-600 to-blue-600',
  className,
}: StatCardProps) {
  return (
    <GlassCard className={cn('p-4', className)} hover>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            'bg-gradient-to-br',
            iconColor
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              {trend.positive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={cn(
                  'text-xs',
                  trend.positive ? 'text-green-500' : 'text-red-500'
                )}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
```

- [ ] **Step 4: Create AppIcon component**

Create `src/components/app/app-icon.tsx`:

```tsx
import { cn } from '@/lib/utils'

interface AppIconProps {
  icon: React.ReactNode
  label: string
  color?: string
  onClick?: () => void
  className?: string
}

export function AppIcon({
  icon,
  label,
  color = 'from-violet-600 to-blue-600',
  onClick,
  className,
}: AppIconProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-2xl',
        'glass glass-dark dark:glass-dark light:glass-light',
        'hover-lift transition-all cursor-pointer',
        'group',
        className
      )}
    >
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl',
          'bg-gradient-to-br transition-transform group-hover:scale-110',
          color
        )}
      >
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
```

- [ ] **Step 5: Create PageTransition component**

Create `src/components/app/page-transition.tsx`:

```tsx
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div className={cn('animate-page-enter', className)}>
      {children}
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/app/
git commit -m "feat: add shared app components (glass-card, gradient-button, stat-card, app-icon, page-transition)"
```

---

## Task 3: Update Router and Navigation

**Files:**
- Modify: `src/app/router.tsx`
- Modify: `src/layouts/components/sidebar.tsx`
- Modify: `src/layouts/components/header.tsx`

- [ ] **Step 1: Add new routes to router**

Modify `src/app/router.tsx` to add lazy-loaded imports and routes:

```typescript
// Add these imports after existing lazy imports
const AppHomePage = lazy(() => import('@/views/app/home/index'))
const AppAiChatPage = lazy(() => import('@/views/app/ai-chat/index'))
const AppSchedulePage = lazy(() => import('@/views/app/schedule/index'))
const AppInfoPage = lazy(() => import('@/views/app/info/index'))
const AppInfoDetailPage = lazy(() => import('@/views/app/info/detail'))
const AppProfilePage = lazy(() => import('@/views/app/profile/index'))
const AppSettingsPage = lazy(() => import('@/views/app/profile/settings'))
```

```typescript
// Add these routes inside the children array of the '/' route
{
  path: 'app',
  element: <Outlet />,
  children: [
    { index: true, element: <Navigate to="/app/home" replace /> },
    { path: 'home', element: wrap(AppHomePage) },
    { path: 'ai-chat', element: wrap(AppAiChatPage) },
    { path: 'schedule', element: wrap(AppSchedulePage) },
    { path: 'info', element: wrap(AppInfoPage) },
    { path: 'info/:id', element: wrap(AppInfoDetailPage) },
    { path: 'profile', element: wrap(AppProfilePage) },
    { path: 'settings', element: wrap(AppSettingsPage) },
  ],
},
```

- [ ] **Step 2: Update sidebar navigation**

Modify `src/layouts/components/sidebar.tsx` to add new navigation items:

```typescript
// Add to the navigation items array
{
  key: 'app',
  label: '应用中心',
  icon: <LayoutGrid className="h-4 w-4" />,
  children: [
    {
      key: 'app-home',
      label: '首页',
      path: '/app/home',
      icon: <Home className="h-4 w-4" />,
    },
    {
      key: 'app-ai-chat',
      label: 'AI 聊天',
      path: '/app/ai-chat',
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      key: 'app-schedule',
      label: '日程管理',
      path: '/app/schedule',
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      key: 'app-info',
      label: '企业资讯',
      path: '/app/info',
      icon: <Globe className="h-4 w-4" />,
    },
    {
      key: 'app-profile',
      label: '个人中心',
      path: '/app/profile',
      icon: <User className="h-4 w-4" />,
    },
  ],
},
```

- [ ] **Step 3: Add mobile bottom navigation**

Create a new component `src/layouts/components/mobile-nav.tsx`:

```tsx
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass glass-dark dark:glass-dark light:glass-light border-t border-white/10 dark:border-white/10 light:border-black/10 md:hidden">
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
```

- [ ] **Step 4: Update header for mobile**

Modify `src/layouts/components/header.tsx` to hide mobile nav on app pages:

```typescript
// Add import
import { MobileNav } from './mobile-nav'
import { useLocation } from 'react-router-dom'

// Add inside the Header component
const location = useLocation()
const isAppPage = location.pathname.startsWith('/app')

// Add at the end of the component return
{isAppPage && <MobileNav />}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/router.tsx src/layouts/components/sidebar.tsx src/layouts/components/header.tsx src/layouts/components/mobile-nav.tsx
git commit -m "feat: add APP routes and mobile navigation"
```

---

## Task 4: Implement Home Page

**Files:**
- Create: `src/views/app/home/index.tsx`

- [ ] **Step 1: Create Home page component**

Create `src/views/app/home/index.tsx`:

```tsx
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { PageTransition } from '@/components/app/page-transition'
import { GlassCard } from '@/components/app/glass-card'
import { StatCard } from '@/components/app/stat-card'
import { AppIcon } from '@/components/app/app-icon'
import {
  Eye,
  CheckSquare,
  Bell,
  Calendar,
  MessageSquare,
  Globe,
  Settings,
  Users,
  BarChart,
  Clock,
  Star,
  Activity,
} from 'lucide-react'

const stats = [
  {
    title: '今日访问量',
    value: '1,234',
    trend: { value: '↑ 12.5%', positive: true },
    icon: <Eye className="h-5 w-5 text-white" />,
    iconColor: 'from-violet-600 to-blue-600',
  },
  {
    title: '待处理任务',
    value: '8',
    trend: { value: '↓ 3 个', positive: false },
    icon: <CheckSquare className="h-5 w-5 text-white" />,
    iconColor: 'from-cyan-600 to-blue-600',
  },
  {
    title: '消息通知',
    value: '23',
    trend: { value: '5 条未读', positive: true },
    icon: <Bell className="h-5 w-5 text-white" />,
    iconColor: 'from-orange-600 to-red-600',
  },
  {
    title: '日程安排',
    value: '3',
    trend: { value: '今日待办', positive: true },
    icon: <Calendar className="h-5 w-5 text-white" />,
    iconColor: 'from-green-600 to-emerald-600',
  },
]

const apps = [
  {
    icon: <MessageSquare className="h-6 w-6 text-white" />,
    label: 'AI 聊天',
    path: '/app/ai-chat',
    color: 'from-violet-600 to-blue-600',
  },
  {
    icon: <Calendar className="h-6 w-6 text-white" />,
    label: '日程管理',
    path: '/app/schedule',
    color: 'from-cyan-600 to-blue-600',
  },
  {
    icon: <Globe className="h-6 w-6 text-white" />,
    label: '企业资讯',
    path: '/app/info',
    color: 'from-orange-600 to-red-600',
  },
  {
    icon: <Settings className="h-6 w-6 text-white" />,
    label: '系统设置',
    path: '/system/config',
    color: 'from-gray-600 to-slate-600',
  },
  {
    icon: <Users className="h-6 w-6 text-white" />,
    label: '用户管理',
    path: '/system/user',
    color: 'from-green-600 to-emerald-600',
  },
  {
    icon: <BarChart className="h-6 w-6 text-white" />,
    label: '数据报表',
    path: '/dashboard/analysis',
    color: 'from-pink-600 to-purple-600',
  },
]

const activities = [
  {
    user: '张三',
    avatar: '张',
    action: '提交了代码',
    target: 'feat: 新增用户导出功能',
    time: '10 分钟前',
  },
  {
    user: '李四',
    avatar: '李',
    action: '创建了任务',
    target: '优化查询性能',
    time: '30 分钟前',
  },
  {
    user: '王五',
    avatar: '王',
    action: '合并了分支',
    target: 'feature/export → main',
    time: '1 小时前',
  },
  {
    user: '赵六',
    avatar: '赵',
    action: '发布了版本',
    target: 'v2.3.0',
    time: '2 小时前',
  },
  {
    user: '钱七',
    avatar: '钱',
    action: '关闭了问题',
    target: '#234 登录页面样式异常',
    time: '3 小时前',
  },
]

const notices = [
  { id: 1, title: '系统将于本周六凌晨 2:00 进行维护升级', time: '2 小时前', type: '通知' },
  { id: 2, title: 'v2.3.0 版本已发布，包含多项功能优化', time: '1 天前', type: '公告' },
  { id: 3, title: '请各部门尽快完成年度数据备份工作', time: '2 天前', type: '通知' },
]

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

export default function AppHomePage() {
  const navigate = useNavigate()
  const userInfo = useUserStore((s) => s.userInfo)
  const nickname = userInfo?.nickname || userInfo?.username || '用户'
  const greeting = getGreeting()

  return (
    <PageTransition className="space-y-6 p-4 md:p-6">
      {/* Welcome banner */}
      <GlassCard>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-lg font-semibold text-white">
            {nickname.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-medium">
              {greeting}，{nickname}，祝你开心每一天！
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              欢迎使用 ContiNew Admin 管理系统
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Quick apps */}
          <GlassCard title="快捷应用">
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
              {apps.map((app) => (
                <AppIcon
                  key={app.path}
                  icon={app.icon}
                  label={app.label}
                  color={app.color}
                  onClick={() => navigate(app.path)}
                />
              ))}
            </div>
          </GlassCard>

          {/* Recent activities */}
          <GlassCard title="最新动态">
            <div className="space-y-0">
              {activities.map((activity, index) => (
                <div key={index}>
                  <div className="flex items-start gap-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-xs font-medium text-white">
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-muted-foreground"> {activity.action} </span>
                        <span className="text-foreground">{activity.target}</span>
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  {index < activities.length - 1 && (
                    <div className="h-px bg-border" />
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Notices */}
          <GlassCard title="最近通知">
            <div className="space-y-0">
              {notices.map((notice, index) => (
                <div key={notice.id}>
                  <div className="flex items-start justify-between gap-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                          {notice.type}
                        </span>
                        <span className="text-sm truncate">{notice.title}</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {notice.time}
                    </span>
                  </div>
                  {index < notices.length - 1 && <div className="h-px bg-border" />}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Carousel placeholder */}
          <GlassCard>
            <div className="relative flex h-40 flex-col items-center justify-center rounded-xl gradient-primary text-white">
              <p className="text-base font-medium">ContNew v2.3.0 正式发布</p>
              <p className="mt-1 text-sm opacity-80">全新暗色模式、性能优化、移动端适配</p>
              <div className="absolute bottom-3 flex gap-1.5">
                <span className="h-1.5 w-5 rounded-full bg-white" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
              </div>
            </div>
          </GlassCard>

          {/* Documentation links */}
          <GlassCard title="文档资源">
            <div className="space-y-2">
              {[
                { label: 'API 接口文档', icon: Activity, href: '/api-docs' },
                { label: '更新日志', icon: Star, href: '/changelog' },
                { label: '使用指南', icon: Globe, href: '/guide' },
              ].map((doc) => (
                <a
                  key={doc.label}
                  href={doc.href}
                  className="flex items-center justify-between rounded-lg p-2.5 text-sm transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-2.5">
                    <doc.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{doc.label}</span>
                  </div>
                </a>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/views/app/home/index.tsx
git commit -m "feat: implement home page with dashboard and app center"
```

---

## Task 5: Implement AI Chat Page

**Files:**
- Create: `src/views/app/ai-chat/index.tsx`
- Create: `src/views/app/ai-chat/components/role-selector.tsx`
- Create: `src/views/app/ai-chat/components/chat-list.tsx`
- Create: `src/views/app/ai-chat/components/chat-window.tsx`
- Create: `src/views/app/ai-chat/components/message-bubble.tsx`
- Create: `src/views/app/ai-chat/components/prompt-panel.tsx`

- [ ] **Step 1: Create RoleSelector component**

Create `src/views/app/ai-chat/components/role-selector.tsx`:

```tsx
import { cn } from '@/lib/utils'
import { Bot, Code, PenTool, BarChart, Scale } from 'lucide-react'

const roles = [
  {
    id: 'general',
    name: '通用助手',
    icon: Bot,
    description: '全能 AI 助手',
    color: 'from-violet-600 to-blue-600',
  },
  {
    id: 'code',
    name: '代码专家',
    icon: Code,
    description: '编程问题解答',
    color: 'from-cyan-600 to-blue-600',
  },
  {
    id: 'writer',
    name: '文案写手',
    icon: PenTool,
    description: '创意文案生成',
    color: 'from-orange-600 to-red-600',
  },
  {
    id: 'analyst',
    name: '数据分析师',
    icon: BarChart,
    description: '数据洞察分析',
    color: 'from-green-600 to-emerald-600',
  },
  {
    id: 'legal',
    name: '法律顾问',
    icon: Scale,
    description: '法律问题咨询',
    color: 'from-gray-600 to-slate-600',
  },
]

interface RoleSelectorProps {
  selectedRole: string
  onSelect: (roleId: string) => void
}

export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {roles.map((role) => {
        const Icon = role.icon
        const isSelected = selectedRole === role.id
        return (
          <button
            key={role.id}
            onClick={() => onSelect(role.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-xl min-w-[80px] transition-all',
              isSelected
                ? 'glass glass-dark border-primary/50 animate-border-glow'
                : 'glass glass-dark hover:bg-white/10'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                'bg-gradient-to-br',
                role.color
              )}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium">{role.name}</span>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create MessageBubble component**

Create `src/views/app/ai-chat/components/message-bubble.tsx`:

```tsx
import { cn } from '@/lib/utils'
import { Bot } from 'lucide-react'

interface MessageBubbleProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }
  roleIcon?: React.ReactNode
}

export function MessageBubble({ message, roleIcon }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex gap-3 animate-stagger-enter',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          isUser
            ? 'gradient-primary'
            : 'glass glass-dark'
        )}
      >
        {isUser ? (
          <span className="text-xs font-medium text-white">U</span>
        ) : (
          roleIcon || <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl p-3',
          isUser
            ? 'gradient-primary text-white rounded-tr-sm'
            : 'glass glass-dark rounded-tl-sm'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            'mt-1 text-xs',
            isUser ? 'text-white/70' : 'text-muted-foreground'
          )}
        >
          {message.timestamp.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create PromptPanel component**

Create `src/views/app/ai-chat/components/prompt-panel.tsx`:

```tsx
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

const prompts = {
  code: [
    '帮我优化这段代码',
    '解释这段代码的功能',
    '生成单元测试',
    '重构为更简洁的写法',
  ],
  writer: [
    '写一篇产品介绍',
    '生成营销文案',
    '润色这段文字',
    '写一封商务邮件',
  ],
  analyst: [
    '分析这份数据',
    '总结这篇文章',
    '对比这些方案',
    '生成数据报告',
  ],
  general: [
    '帮我写一封邮件',
    '解释这个概念',
    '给些建议',
    '头脑风暴',
  ],
}

interface PromptPanelProps {
  role: string
  onSelect: (prompt: string) => void
}

export function PromptPanel({ role, onSelect }: PromptPanelProps) {
  const rolePrompts = prompts[role as keyof typeof prompts] || prompts.general

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        <span>快捷提示词</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {rolePrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs',
              'glass glass-dark hover:bg-white/10 transition-colors'
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create ChatList component**

Create `src/views/app/ai-chat/components/chat-list.tsx`:

```tsx
import { cn } from '@/lib/utils'
import { Bot, Code, PenTool, BarChart, Scale, Trash2 } from 'lucide-react'

const roleIcons: Record<string, React.ReactNode> = {
  general: <Bot className="h-4 w-4" />,
  code: <Code className="h-4 w-4" />,
  writer: <PenTool className="h-4 w-4" />,
  analyst: <BarChart className="h-4 w-4" />,
  legal: <Scale className="h-4 w-4" />,
}

interface Chat {
  id: string
  title: string
  role: string
  lastMessage: string
  time: string
  unread?: number
}

interface ChatListProps {
  chats: Chat[]
  selectedChat: string | null
  onSelect: (chatId: string) => void
  onDelete: (chatId: string) => void
}

export function ChatList({
  chats,
  selectedChat,
  onSelect,
  onDelete,
}: ChatListProps) {
  return (
    <div className="space-y-1">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group',
            selectedChat === chat.id
              ? 'glass glass-dark border-primary/50'
              : 'hover:bg-white/5'
          )}
          onClick={() => onSelect(chat.id)}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg glass glass-dark">
            {roleIcons[chat.role] || <Bot className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium truncate">{chat.title}</p>
              <span className="text-xs text-muted-foreground">{chat.time}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {chat.lastMessage}
            </p>
          </div>
          {chat.unread && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              {chat.unread}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(chat.id)
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Create ChatWindow component**

Create `src/views/app/ai-chat/components/chat-window.tsx`:

```tsx
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Send, Paperclip, Mic } from 'lucide-react'
import { MessageBubble } from './message-bubble'
import { PromptPanel } from './prompt-panel'
import { GradientButton } from '@/components/app/gradient-button'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatWindowProps {
  role: string
  messages: Message[]
  onSend: (message: string) => void
}

export function ChatWindow({ role, messages, onSend }: ChatWindowProps) {
  const [input, setInput] = useState('')
  const [showPrompts, setShowPrompts] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    onSend(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-lg">开始新的对话</p>
            <p className="text-sm mt-2">选择一个 AI 角色开始聊天</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 glass glass-dark border-t border-white/10">
        {showPrompts && (
          <div className="mb-3">
            <PromptPanel
              role={role}
              onSelect={(prompt) => {
                setInput(prompt)
                setShowPrompts(false)
              }}
            />
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
              showPrompts ? 'bg-primary text-white' : 'glass glass-dark hover:bg-white/10'
            )}
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              rows={1}
              className={cn(
                'w-full resize-none rounded-xl p-3 pr-10',
                'glass glass-dark focus:outline-none focus:ring-2 focus:ring-primary/50',
                'min-h-[40px] max-h-[120px]'
              )}
              style={{
                height: 'auto',
                minHeight: '40px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`
              }}
            />
            <button
              onClick={() => {/* Voice input */}}
              className="absolute right-3 bottom-3 text-muted-foreground hover:text-foreground"
            >
              <Mic className="h-4 w-4" />
            </button>
          </div>

          <GradientButton onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </GradientButton>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create main AI Chat page**

Create `src/views/app/ai-chat/index.tsx`:

```tsx
import { useState } from 'react'
import { PageTransition } from '@/components/app/page-transition'
import { GlassCard } from '@/components/app/glass-card'
import { RoleSelector } from './components/role-selector'
import { ChatList } from './components/chat-list'
import { ChatWindow } from './components/chat-window'
import { Plus } from 'lucide-react'
import { GradientButton } from '@/components/app/gradient-button'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  role: string
  lastMessage: string
  time: string
  messages: Message[]
  unread?: number
}

const initialChats: Chat[] = [
  {
    id: '1',
    title: '代码优化讨论',
    role: 'code',
    lastMessage: '这段代码可以这样优化...',
    time: '10:30',
    messages: [
      {
        id: '1-1',
        role: 'user',
        content: '帮我优化这段代码',
        timestamp: new Date('2026-05-29T10:25:00'),
      },
      {
        id: '1-2',
        role: 'assistant',
        content: '这段代码可以这样优化：\n\n1. 使用 useMemo 缓存计算结果\n2. 减少不必要的重渲染\n3. 使用 useCallback 优化回调函数',
        timestamp: new Date('2026-05-29T10:30:00'),
      },
    ],
  },
  {
    id: '2',
    title: '产品文案撰写',
    role: 'writer',
    lastMessage: '好的，我来帮您写一篇产品介绍...',
    time: '昨天',
    messages: [],
  },
  {
    id: '3',
    title: '数据分析报告',
    role: 'analyst',
    lastMessage: '根据数据趋势分析...',
    time: '周一',
    messages: [],
  },
]

export default function AppAiChatPage() {
  const [selectedRole, setSelectedRole] = useState('general')
  const [selectedChat, setSelectedChat] = useState<string | null>('1')
  const [chats, setChats] = useState<Chat[]>(initialChats)

  const currentChat = chats.find((c) => c.id === selectedChat)

  const handleSend = (content: string) => {
    if (!selectedChat) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === selectedChat) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: content,
            time: '刚刚',
          }
        }
        return chat
      })
    )

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '收到您的消息，我正在思考...',
        timestamp: new Date(),
      }

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === selectedChat) {
            return {
              ...chat,
              messages: [...chat.messages, aiResponse],
              lastMessage: aiResponse.content,
              time: '刚刚',
            }
          }
          return chat
        })
      )
    }, 1000)
  }

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: '新对话',
      role: selectedRole,
      lastMessage: '',
      time: '刚刚',
      messages: [],
    }
    setChats((prev) => [newChat, ...prev])
    setSelectedChat(newChat.id)
  }

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    if (selectedChat === chatId) {
      setSelectedChat(null)
    }
  }

  return (
    <PageTransition className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Role selector */}
      <div className="p-4 border-b border-border">
        <RoleSelector selectedRole={selectedRole} onSelect={setSelectedRole} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat list - hidden on mobile when chat is selected */}
        <div
          className={`w-full md:w-80 border-r border-border flex flex-col ${
            selectedChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-border">
            <GradientButton onClick={handleNewChat} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              新建对话
            </GradientButton>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <ChatList
              chats={chats}
              selectedChat={selectedChat}
              onSelect={setSelectedChat}
              onDelete={handleDeleteChat}
            />
          </div>
        </div>

        {/* Chat window - hidden on mobile when no chat selected */}
        <div
          className={`flex-1 flex flex-col ${
            !selectedChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {currentChat ? (
            <ChatWindow
              role={currentChat.role}
              messages={currentChat.messages}
              onSend={handleSend}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg">选择一个对话开始聊天</p>
                <p className="text-sm mt-2">或创建一个新对话</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/views/app/ai-chat/
git commit -m "feat: implement AI chat page with multi-role support"
```

---

## Task 6: Implement Schedule Page

**Files:**
- Create: `src/views/app/schedule/index.tsx`
- Create: `src/views/app/schedule/components/calendar-view.tsx`
- Create: `src/views/app/schedule/components/event-modal.tsx`

- [ ] **Step 1: Create CalendarView component**

Create `src/views/app/schedule/components/calendar-view.tsx`:

```tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarViewProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  events?: Array<{
    date: Date
    color: string
  }>
}

export function CalendarView({
  selectedDate,
  onDateSelect,
  events = [],
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startDay = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const today = new Date()
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  const isSelected = (date: Date) =>
    date.getDate() === selectedDate.getDate() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getFullYear() === selectedDate.getFullYear()

  const hasEvent = (date: Date) =>
    events.some(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    )

  const getEventColor = (date: Date) => {
    const event = events.find(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    )
    return event?.color || 'bg-primary'
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const days: Date[] = []

  // Previous month days
  for (let i = startDay - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i))
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  // Next month days
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i))
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-medium">
          {year}年{month + 1}月
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === month
          const isTodayDate = isToday(date)
          const isSelectedDate = isSelected(date)
          const hasEventDate = hasEvent(date)

          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={cn(
                'relative h-10 rounded-lg text-sm transition-all',
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50',
                isSelectedDate && 'gradient-primary text-white',
                isTodayDate && !isSelectedDate && 'bg-primary/10 text-primary',
                !isSelectedDate && !isTodayDate && 'hover:bg-muted'
              )}
            >
              {date.getDate()}
              {hasEventDate && (
                <span
                  className={cn(
                    'absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full',
                    isSelectedDate ? 'bg-white' : getEventColor(date)
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create EventModal component**

Create `src/views/app/schedule/components/event-modal.tsx`:

```tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2 } from 'lucide-react'

interface EventModalProps {
  open: boolean
  onClose: () => void
  onSave: (event: any) => void
  onDelete?: () => void
  event?: any
}

export function EventModal({
  open,
  onClose,
  onSave,
  onDelete,
  event,
}: EventModalProps) {
  const [title, setTitle] = useState(event?.title || '')
  const [startDate, setStartDate] = useState(event?.startDate || '')
  const [endDate, setEndDate] = useState(event?.endDate || '')
  const [category, setCategory] = useState(event?.category || 'work')
  const [reminder, setReminder] = useState(event?.reminder || '15min')
  const [notes, setNotes] = useState(event?.notes || '')

  const handleSave = () => {
    onSave({
      title,
      startDate,
      endDate,
      category,
      reminder,
      notes,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass glass-dark">
        <DialogHeader>
          <DialogTitle>{event ? '编辑日程' : '新建日程'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入日程标题"
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">开始时间</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">结束时间</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>分类</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">工作</SelectItem>
                  <SelectItem value="personal">个人</SelectItem>
                  <SelectItem value="important">重要</SelectItem>
                  <SelectItem value="reminder">提醒</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>提醒</Label>
              <Select value={reminder} onValueChange={setReminder}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5min">提前 5 分钟</SelectItem>
                  <SelectItem value="15min">提前 15 分钟</SelectItem>
                  <SelectItem value="1hour">提前 1 小时</SelectItem>
                  <SelectItem value="1day">提前 1 天</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="添加备注..."
              className="rounded-xl"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-between">
          {onDelete && (
            <Button
              variant="destructive"
              onClick={onDelete}
              className="rounded-xl"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose} className="rounded-xl">
              取消
            </Button>
            <Button onClick={handleSave} className="rounded-xl gradient-primary">
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Create main Schedule page**

Create `src/views/app/schedule/index.tsx`:

```tsx
import { useState } from 'react'
import { PageTransition } from '@/components/app/page-transition'
import { GlassCard } from '@/components/app/glass-card'
import { GradientButton } from '@/components/app/gradient-button'
import { CalendarView } from './components/calendar-view'
import { EventModal } from './components/event-modal'
import { Plus, Calendar, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScheduleEvent {
  id: string
  title: string
  startDate: string
  endDate: string
  category: 'work' | 'personal' | 'important' | 'reminder'
  color: string
  notes?: string
}

const categoryColors: Record<string, string> = {
  work: 'bg-blue-500',
  personal: 'bg-purple-500',
  important: 'bg-red-500',
  reminder: 'bg-orange-500',
}

const initialEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: '团队周会',
    startDate: '2026-05-29T10:00',
    endDate: '2026-05-29T11:00',
    category: 'work',
    color: categoryColors.work,
  },
  {
    id: '2',
    title: '午餐约会',
    startDate: '2026-05-29T12:00',
    endDate: '2026-05-29T13:00',
    category: 'personal',
    color: categoryColors.personal,
  },
  {
    id: '3',
    title: '项目截止日期',
    startDate: '2026-05-30T18:00',
    endDate: '2026-05-30T18:00',
    category: 'important',
    color: categoryColors.important,
  },
]

export default function AppSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents)
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(
    null
  )

  const todayEvents = events.filter((event) => {
    const eventDate = new Date(event.startDate)
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    )
  })

  const handleSaveEvent = (eventData: any) => {
    if (selectedEvent) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEvent.id
            ? { ...e, ...eventData, color: categoryColors[eventData.category] }
            : e
        )
      )
    } else {
      const newEvent: ScheduleEvent = {
        id: Date.now().toString(),
        ...eventData,
        color: categoryColors[eventData.category],
      }
      setEvents((prev) => [...prev, newEvent])
    }
    setSelectedEvent(null)
  }

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id))
      setSelectedEvent(null)
      setShowModal(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <PageTransition className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">日程管理</h1>
        <GradientButton
          onClick={() => {
            setSelectedEvent(null)
            setShowModal(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          新建日程
        </GradientButton>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Calendar */}
        <GlassCard>
          <CalendarView
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            events={events.map((e) => ({
              date: new Date(e.startDate),
              color: e.color,
            }))}
          />
        </GlassCard>

        {/* Today's events */}
        <div className="space-y-4">
          <GlassCard title={`${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日 日程`}>
            {todayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>暂无日程安排</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      'p-3 rounded-xl cursor-pointer transition-all hover:bg-muted',
                      'border-l-4',
                      event.color
                    )}
                    onClick={() => {
                      setSelectedEvent(event)
                      setShowModal(true)
                    }}
                  >
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatTime(event.startDate)} - {formatTime(event.endDate)}
                      </span>
                    </div>
                    {event.notes && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Upcoming events */}
          <GlassCard title="即将到来">
            <div className="space-y-3">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event)
                    setShowModal(true)
                  }}
                >
                  <div className={cn('h-2 w-2 rounded-full', event.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Event modal */}
      <EventModal
        open={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedEvent(null)
        }}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
        event={selectedEvent}
      />
    </PageTransition>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/views/app/schedule/
git commit -m "feat: implement schedule page with calendar and event management"
```

---

## Task 7: Implement Enterprise Info Page

**Files:**
- Create: `src/views/app/info/index.tsx`
- Create: `src/views/app/info/detail.tsx`
- Create: `src/views/app/info/components/carousel.tsx`
- Create: `src/views/app/info/components/article-card.tsx`

- [ ] **Step 1: Create Carousel component**

Create `src/views/app/info/components/carousel.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselItem {
  id: string
  title: string
  description: string
  image?: string
  color: string
}

interface CarouselProps {
  items: CarouselItem[]
  autoPlay?: boolean
  interval?: number
}

export function Carousel({
  items,
  autoPlay = true,
  interval = 5000,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!autoPlay) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, items.length])

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  return (
    <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden group">
      {/* Slides */}
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div
            className={cn('w-full h-full bg-gradient-to-br', item.color)}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
              <h3 className="text-lg md:text-xl font-bold text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-white/80">{item.description}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/50"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/50"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              index === currentIndex
                ? 'w-5 bg-white'
                : 'w-1.5 bg-white/50 hover:bg-white/75'
            )}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ArticleCard component**

Create `src/views/app/info/components/article-card.tsx`:

```tsx
import { cn } from '@/lib/utils'
import { Clock, Eye, Heart } from 'lucide-react'

interface ArticleCardProps {
  article: {
    id: string
    title: string
    summary: string
    category: string
    cover?: string
    author: {
      name: string
      avatar: string
    }
    date: string
    views: number
    likes: number
  }
  onClick?: () => void
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <div
      className={cn(
        'group cursor-pointer rounded-2xl overflow-hidden',
        'glass glass-dark hover-lift transition-all'
      )}
      onClick={onClick}
    >
      {/* Cover image */}
      <div className="relative h-40 overflow-hidden">
        {article.cover ? (
          <img
            src={article.cover}
            alt={article.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full gradient-primary" />
        )}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {article.summary}
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center text-[10px] text-white">
              {article.author.avatar}
            </div>
            <span className="text-xs text-muted-foreground">
              {article.author.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.date}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {article.likes}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create main Info page**

Create `src/views/app/info/index.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageTransition } from '@/components/app/page-transition'
import { GlassCard } from '@/components/app/glass-card'
import { Carousel } from './components/carousel'
import { ArticleCard } from './components/article-card'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const carouselItems = [
  {
    id: '1',
    title: 'ContNew v2.3.0 正式发布',
    description: '全新暗色模式、性能优化、移动端适配',
    color: 'from-violet-600 to-blue-600',
  },
  {
    id: '2',
    title: '开发者大会 2026',
    description: '6 月 15 日，线上直播，免费报名',
    color: 'from-cyan-600 to-blue-600',
  },
  {
    id: '3',
    title: '插件市场全新上线',
    description: '海量插件，一键安装，生态共建',
    color: 'from-orange-600 to-red-600',
  },
]

const categories = ['全部', '公司新闻', '行业动态', '技术文章', '活动公告']

const articles = [
  {
    id: '1',
    title: 'React 19 新特性解析：Server Components 实战指南',
    summary:
      '深入解析 React 19 的 Server Components 特性，通过实际案例展示如何在项目中应用。',
    category: '技术文章',
    author: { name: '张三', avatar: '张' },
    date: '2 小时前',
    views: 1234,
    likes: 56,
  },
  {
    id: '2',
    title: '公司年度技术峰会圆满落幕',
    summary:
      '为期三天的技术峰会吸引了来自全国各地的开发者参与，分享了最新的技术趋势和实践经验。',
    category: '公司新闻',
    author: { name: '李四', avatar: '李' },
    date: '1 天前',
    views: 892,
    likes: 34,
  },
  {
    id: '3',
    title: '2026 年前端开发趋势预测',
    summary:
      '从 AI 辅助开发到边缘计算，探索 2026 年前端开发的几大趋势。',
    category: '行业动态',
    author: { name: '王五', avatar: '王' },
    date: '2 天前',
    views: 2341,
    likes: 128,
  },
  {
    id: '4',
    title: '开源项目贡献指南发布',
    summary:
      '为了更好地管理开源社区贡献，我们发布了全新的贡献指南和流程说明。',
    category: '公司新闻',
    author: { name: '赵六', avatar: '赵' },
    date: '3 天前',
    views: 567,
    likes: 23,
  },
  {
    id: '5',
    title: 'AI 编程助手使用技巧分享',
    summary:
      '分享如何高效使用 AI 编程助手提升开发效率，包括提示词工程和最佳实践。',
    category: '技术文章',
    author: { name: '钱七', avatar: '钱' },
    date: '4 天前',
    views: 3456,
    likes: 189,
  },
  {
    id: '6',
    title: '线下技术沙龙报名开启',
    summary:
      '本周末将在北京、上海、深圳三地同步举办技术沙龙，欢迎报名参加。',
    category: '活动公告',
    author: { name: '孙八', avatar: '孙' },
    date: '5 天前',
    views: 789,
    likes: 45,
  },
]

export default function AppInfoPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === '全部' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <PageTransition className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">企业资讯</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      {/* Carousel */}
      <Carousel items={carouselItems} />

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors',
              selectedCategory === category
                ? 'gradient-primary text-white'
                : 'glass glass-dark hover:bg-white/10'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onClick={() => navigate(`/app/info/${article.id}`)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">未找到相关文章</p>
          <p className="text-sm mt-2">尝试调整搜索条件或分类筛选</p>
        </div>
      )}
    </PageTransition>
  )
}
```

- [ ] **Step 4: Create Article Detail page**

Create `src/views/app/info/detail.tsx`:

```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { PageTransition } from '@/components/app/page-transition'
import { GlassCard } from '@/components/app/glass-card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Clock,
  Eye,
  Heart,
  Share2,
  Bookmark,
} from 'lucide-react'

const articles: Record<string, any> = {
  '1': {
    title: 'React 19 新特性解析：Server Components 实战指南',
    category: '技术文章',
    author: { name: '张三', avatar: '张' },
    date: '2026-05-27',
    views: 1234,
    likes: 56,
    content: `
# React 19 新特性解析

## Server Components 简介

Server Components 是 React 19 中最重要的新特性之一。它允许组件在服务器端渲染，从而减少客户端 JavaScript 包大小，提高页面加载速度。

## 核心优势

1. **减少包大小**：Server Components 不会发送到客户端
2. **直接数据访问**：可以在组件中直接访问数据库
3. **自动代码分割**：无需手动配置 lazy loading

## 实战示例

\`\`\`tsx
// 这是一个 Server Component
async function UserProfile({ userId }: { userId: string }) {
  const user = await db.user.findUnique({ where: { id: userId } })
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
\`\`\`

## 总结

Server Components 为 React 应用带来了更好的性能和开发体验。建议在新项目中尝试使用。
    `,
  },
}

export default function AppInfoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const article = articles[id || '1'] || articles['1']

  return (
    <PageTransition className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/app/info')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        返回列表
      </Button>

      {/* Article header */}
      <GlassCard>
        <div className="space-y-4">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
            {article.category}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs text-white">
                {article.author.avatar}
              </div>
              <span>{article.author.name}</span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.date}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {article.likes}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Article content */}
      <GlassCard>
        <div className="prose prose-invert max-w-none">
          {article.content.split('\n').map((line: string, index: number) => {
            if (line.startsWith('# ')) {
              return (
                <h1 key={index} className="text-2xl font-bold mt-8 mb-4">
                  {line.slice(2)}
                </h1>
              )
            }
            if (line.startsWith('## ')) {
              return (
                <h2 key={index} className="text-xl font-semibold mt-6 mb-3">
                  {line.slice(3)}
                </h2>
              )
            }
            if (line.startsWith('```')) {
              return null
            }
            if (line.trim() === '') {
              return <br key={index} />
            }
            return (
              <p key={index} className="mb-2">
                {line}
              </p>
            )
          })}
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Heart className="h-4 w-4" />
            点赞
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl">
            <Bookmark className="h-4 w-4" />
            收藏
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl">
            <Share2 className="h-4 w-4" />
            分享
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/views/app/info/
git commit -m "feat: implement enterprise info page with article system"
```

---

## Task 8: Implement Profile Page

**Files:**
- Create: `src/views/app/profile/index.tsx`
- Create: `src/views/app/profile/settings.tsx`

- [ ] **Step 1: Create main Profile page**

Create `src/views/app/profile/index.tsx`:

```tsx
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { useTheme } from '@/hooks/use-theme'
import { PageTransition } from '@/components/app/page-transition'
import { GlassCard } from '@/components/app/glass-card'
import {
  User,
  Bell,
  Heart,
  BarChart,
  Settings,
  Moon,
  Sun,
  Info,
  LogOut,
  ChevronRight,
  Lock,
  Users,
  Shield,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AppProfilePage() {
  const navigate = useNavigate()
  const userInfo = useUserStore((s) => s.userInfo)
  const permissions = useUserStore((s) => s.permissions)
  const logout = useUserStore((s) => s.logout)
  const { theme, toggleTheme } = useTheme()

  const nickname = userInfo?.nickname || userInfo?.username || '用户'
  const isAdmin =
    permissions.includes('*:*:*') || permissions.includes('system:user:list')

  const menuItems = [
    {
      icon: User,
      label: '我的信息',
      description: '头像、昵称、手机号、邮箱',
      path: '/user/profile',
    },
    {
      icon: Bell,
      label: '消息通知',
      description: '系统通知、个人消息',
      badge: 5,
    },
    {
      icon: Heart,
      label: '我的收藏',
      description: '收藏的文章、对话',
    },
    {
      icon: BarChart,
      label: '使用统计',
      description: 'AI 对话次数、日程数量、活跃天数',
    },
  ]

  const adminItems = [
    {
      icon: Users,
      label: '用户管理',
      path: '/system/user',
      permission: 'system:user:list',
    },
    {
      icon: Shield,
      label: '角色管理',
      path: '/system/role',
      permission: 'system:role:list',
    },
    {
      icon: Menu,
      label: '菜单管理',
      path: '/system/menu',
      permission: 'system:menu:list',
    },
    {
      icon: Settings,
      label: '系统配置',
      path: '/system/config',
      permission: 'system:config:list',
    },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <PageTransition className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
      {/* User info */}
      <GlassCard>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-white">
              {nickname.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center">
              <User className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{nickname}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {userInfo?.email || '暂无邮箱'}
            </p>
          </div>
          <button
            onClick={() => navigate('/app/settings')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </GlassCard>

      {/* Menu items */}
      <GlassCard>
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => item.path && navigate(item.path)}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              {item.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Admin section */}
      {isAdmin && (
        <GlassCard title="系统管理">
          <div className="grid grid-cols-2 gap-3">
            {adminItems.map((item, index) => {
              const hasPermission =
                permissions.includes('*:*:*') ||
                permissions.includes(item.permission)

              return (
                <button
                  key={index}
                  onClick={() => hasPermission && navigate(item.path)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl transition-colors',
                    hasPermission
                      ? 'hover:bg-muted cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {hasPermission ? (
                      <item.icon className="h-5 w-5 text-primary" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            })}
          </div>
        </GlassCard>
      )}

      {/* Theme toggle */}
      <GlassCard>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors"
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {theme === 'dark' ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">主题设置</p>
            <p className="text-sm text-muted-foreground">
              当前：{theme === 'dark' ? '深色模式' : '亮色模式'}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </GlassCard>

      {/* Other options */}
      <GlassCard>
        <div className="space-y-1">
          <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">关于我们</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-destructive/10 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-destructive">退出登录</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </GlassCard>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Create Settings page**

Create `src/views/app/profile/settings.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { PageTransition } from '@/components/app/page-transition'
import { GlassCard } from '@/components/app/glass-card'
import { GradientButton } from '@/components/app/gradient-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function AppSettingsPage() {
  const navigate = useNavigate()
  const userInfo = useUserStore((s) => s.userInfo)

  const [nickname, setNickname] = useState(userInfo?.nickname || '')
  const [email, setEmail] = useState(userInfo?.email || '')
  const [phone, setPhone] = useState(userInfo?.phone || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success('保存成功')
    setLoading(false)
  }

  return (
    <PageTransition className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/app/profile')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <h1 className="text-2xl font-bold">个人设置</h1>
      </div>

      {/* Avatar */}
      <GlassCard>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-white">
            {nickname.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-medium">头像</p>
            <p className="text-sm text-muted-foreground">
              点击更换头像
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Basic info */}
      <GlassCard title="基本信息">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">昵称</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">手机号</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="rounded-xl"
            />
          </div>
        </div>
      </GlassCard>

      {/* Security */}
      <GlassCard title="安全设置">
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors">
            <div>
              <p className="font-medium">修改密码</p>
              <p className="text-sm text-muted-foreground">
                定期更换密码以保障账户安全
              </p>
            </div>
            <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors">
            <div>
              <p className="font-medium">绑定手机</p>
              <p className="text-sm text-muted-foreground">
                已绑定：{phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定'}
              </p>
            </div>
            <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors">
            <div>
              <p className="font-medium">绑定邮箱</p>
              <p className="text-sm text-muted-foreground">
                已绑定：{email || '未绑定'}
              </p>
            </div>
            <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
          </button>
        </div>
      </GlassCard>

      {/* Save button */}
      <div className="flex justify-end">
        <GradientButton onClick={handleSave} loading={loading}>
          <Save className="h-4 w-4 mr-2" />
          保存修改
        </GradientButton>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/views/app/profile/
git commit -m "feat: implement profile and settings pages"
```

---

## Task 9: Final Integration and Testing

**Files:**
- Modify: `src/app/router.tsx` (verify routes)
- Modify: `src/layouts/components/sidebar.tsx` (verify navigation)
- Modify: `src/layouts/components/header.tsx` (verify mobile nav)

- [ ] **Step 1: Verify all routes are correctly configured**

Check that all new routes are properly added to the router:

```bash
# Start dev server
npm run dev
```

Test the following URLs:
- http://localhost:5173/app/home
- http://localhost:5173/app/ai-chat
- http://localhost:5173/app/schedule
- http://localhost:5173/app/info
- http://localhost:5173/app/profile
- http://localhost:5173/app/settings

- [ ] **Step 2: Verify navigation works**

1. Check sidebar navigation items appear
2. Check mobile bottom navigation appears on app pages
3. Test navigation between pages

- [ ] **Step 3: Test responsive design**

1. Test on desktop (≥1024px)
2. Test on tablet (768px - 1023px)
3. Test on mobile (<768px)

- [ ] **Step 4: Test theme switching**

1. Toggle between light and dark themes
2. Verify all components adapt to theme changes
3. Check glassmorphism effects work in both themes

- [ ] **Step 5: Run linting**

```bash
npm run lint
```

Fix any linting errors.

- [ ] **Step 6: Run type checking**

```bash
npm run build
```

Fix any TypeScript errors.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: complete APP pages implementation with responsive design and theme support"
```

---

## Summary

This implementation plan covers:

1. **Design System Foundation**: CSS animations, theme store, theme hook
2. **Shared Components**: GlassCard, GradientButton, StatCard, AppIcon, PageTransition
3. **Router & Navigation**: New routes, sidebar updates, mobile bottom navigation
4. **Home Page**: Dashboard with stats, quick apps, activities, notices
5. **AI Chat Page**: Multi-role support, chat list, message bubbles, prompt panel
6. **Schedule Page**: Calendar view, event management, modal for creating/editing events
7. **Enterprise Info Page**: Carousel, article cards, article detail page
8. **Profile Page**: User info, menu items, admin section, theme toggle
9. **Settings Page**: Profile editing, security settings

All pages feature:
- Glassmorphism effects
- Gradient colors
- Responsive design (mobile + desktop)
- Dark/light theme support
- Smooth animations
- Integration with existing Zustand stores
