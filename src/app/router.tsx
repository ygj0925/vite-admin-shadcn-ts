import { lazy, Suspense, useMemo, useState, useEffect } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, Outlet } from 'react-router-dom'
import { useRouteStore } from '@/stores/route'
import { useUserStore } from '@/stores/user'
import { getUserRoute } from '@/apis/auth'
import { AuthGuard } from './auth-guard'
import { Layout } from '@/layouts'
import type { RouteItem } from '@/types/api'

// Eagerly discover all view modules
const viewModules = import.meta.glob('../views/**/*.tsx')

// Lazy load pages
const LoginPage = lazy(() => import('@/views/login/index'))
const PwdExpiredPage = lazy(() => import('@/views/login/pwd-expired'))
const SocialCallback = lazy(() => import('@/views/login/social-callback'))
const CorpSelectPage = lazy(() => import('@/views/login/corp-select/index'))
const NotImplementedPage = lazy(() => import('@/views/errors/not-implemented'))
const ForbiddenPage = lazy(() => import('@/views/errors/403'))
const NotFoundPage = lazy(() => import('@/views/errors/404'))
const ServerErrorPage = lazy(() => import('@/views/errors/500'))
const AboutPage = lazy(() => import('@/views/about/index'))
const ApiDocPage = lazy(() => import('@/views/about/document/api'))
const ChangelogPage = lazy(() => import('@/views/about/document/changelog'))
const RedirectPage = lazy(() => import('@/views/redirect/index'))
const WorkplacePage = lazy(() => import('@/views/dashboard/workplace/index'))
const AnalysisPage = lazy(() => import('@/views/dashboard/analysis/index'))
const ITDashboardPage = lazy(() => import('@/views/it-dashboard/index'))
const ITDashboardTabsPage = lazy(() => import('@/views/it-dashboard/tabs/index'))
const DictTreePage = lazy(() => import('@/views/system/dict/tree'))
const ViewNoticePage = lazy(() => import('@/views/system/notice/view'))
const RoleTreePage = lazy(() => import('@/views/system/role/tree'))
const UserDeptPage = lazy(() => import('@/views/system/user/dept'))

// APP pages
const AppHomePage = lazy(() => import('@/views/app/home/index'))
const AppAiChatPage = lazy(() => import('@/views/app/ai-chat/index'))
const AppSchedulePage = lazy(() => import('@/views/app/schedule/index'))
const AppInfoPage = lazy(() => import('@/views/app/info/index'))
const AppInfoDetailPage = lazy(() => import('@/views/app/info/detail'))
const AppProfilePage = lazy(() => import('@/views/app/profile/index'))
const AppSettingsPage = lazy(() => import('@/views/app/profile/settings'))

function resolveComponent(component: string) {
  if (!component || component === 'Layout') return null

  const normalized = component
    .replace(/\.vue$/, '')
    .replace(/\/index$/, '')
    .replace(/^views\//, '')
    .replace(/^@\/views\//, '')
  const candidates = [
    `../views/${normalized}/index.tsx`,
    `../views/${normalized}.tsx`,
  ]
  for (const key of candidates) {
    if (viewModules[key]) {
      return lazy(viewModules[key] as () => Promise<{ default: React.ComponentType }>)
    }
  }
  if (import.meta.env.DEV) {
    console.warn(`[router] 未匹配到视图组件: "${component}" (normalized: "${normalized}")`)
  }
  return NotImplementedPage
}

function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

function wrap(Component: React.ComponentType) {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  )
}

function buildDynamicRoutes(routes: RouteItem[], parentPath = ''): any[] {
  const result: any[] = []
  for (const route of routes) {
    const isHidden = (route as any).isHidden ?? route.meta?.hidden ?? false
    if (isHidden) continue

    const isLayoutNode = (route as any).component === 'Layout' || (route as any).component === 'ParentView' || !route.component

    const rawPath = route.path || ''
    const absolutePath = rawPath.startsWith('/')
      ? rawPath
      : `${parentPath}/${rawPath}`.replace(/\/+/g, '/')
    let relativePath = rawPath
    if (parentPath && rawPath.startsWith(parentPath + '/')) {
      relativePath = rawPath.slice(parentPath.length + 1)
    } else if (rawPath.startsWith('/')) {
      relativePath = rawPath.slice(1)
    }

    if (STATIC_OWNED_PATHS.has(absolutePath)) continue

    if (isLayoutNode) {
      if (route.children && route.children.length > 0) {
        result.push({
          path: relativePath,
          element: <Outlet />,
          children: buildDynamicRoutes(route.children, absolutePath),
        })
      }
    } else {
      const Component = resolveComponent(route.component)
      if (!Component) continue
      const routeConfig: any = {
        path: relativePath,
        element: wrap(Component),
      }
      if (route.children && route.children.length > 0) {
        routeConfig.children = buildDynamicRoutes(route.children, absolutePath)
      }
      result.push(routeConfig)
    }
  }
  return result
}

const STATIC_OWNED_PATHS = new Set<string>(['/system/notice/view'])

/**
 * 构建完整的路由配置
 */
function buildRouterConfig(dynamicRoutes: RouteItem[]) {
  const dynamic = buildDynamicRoutes(dynamicRoutes)
  return [
    { path: '/login', element: wrap(LoginPage) },
    { path: '/it-dashboard', element: wrap(ITDashboardPage) },
    { path: '/it-dashboard-tabs', element: wrap(ITDashboardTabsPage) },
    { path: '/pwdExpired', element: wrap(PwdExpiredPage) },
    { path: '/social/callback', element: wrap(SocialCallback) },
    { path: '/corp-select', element: wrap(CorpSelectPage) },
    { path: '/403', element: wrap(ForbiddenPage) },
    { path: '/500', element: wrap(ServerErrorPage) },
    {
      path: '/',
      element: <AuthGuard><Layout /></AuthGuard>,
      children: [
        { index: true, element: <Navigate to="/dashboard/workplace" replace /> },
        { path: 'dashboard/workplace', element: wrap(WorkplacePage) },
        { path: 'dashboard/analysis', element: wrap(AnalysisPage) },
        { path: 'about', element: wrap(AboutPage) },
        { path: 'about/document/api', element: wrap(ApiDocPage) },
        { path: 'about/document/changelog', element: wrap(ChangelogPage) },
        { path: 'system/dict/tree', element: wrap(DictTreePage) },
        { path: 'system/notice/view/:id', element: wrap(ViewNoticePage) },
        { path: 'system/role/tree', element: wrap(RoleTreePage) },
        { path: 'system/user/dept', element: wrap(UserDeptPage) },
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
        { path: 'redirect/:path', element: wrap(RedirectPage) },
        ...dynamic,
        { path: '*', element: wrap(NotFoundPage) },
      ],
    },
    { path: '*', element: wrap(NotFoundPage) },
  ]
}

/**
 * AppRouter —— 对标 Vue 项目的路由初始化流程
 *
 * Vue 流程：router.beforeEach → userStore.getInfo() → routeStore.generateRoutes()
 *          → router.addRoute() → next({...to, replace: true})
 *
 * React 等价：在组件渲染前先获取路由，用获取到的完整路由表创建 router，
 *            确保 RouterProvider 首次渲染时就有完整的路由表。
 */
export function AppRouter() {
  const token = useUserStore((s) => s.token)
  const setDynamicRoutes = useRouteStore((s) => s.setDynamicRoutes)
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)
  const [routesLoaded, setRoutesLoaded] = useState(false)

  // 核心逻辑：和 Vue 的 guard.ts 一致，在渲染前先获取路由
  useEffect(() => {
    if (!token) {
      setRoutesLoaded(true)
      return
    }

    // 已有路由数据（从 Zustand persist 恢复），直接标记完成
    if (dynamicRoutes.length > 0) {
      setRoutesLoaded(true)
      return
    }

    // 没有路由数据，从 API 获取（对标 Vue 的 routeStore.generateRoutes()）
    getUserRoute()
      .then((res) => {
        setDynamicRoutes(res.data)
      })
      .catch((err) => {
        console.error('[AppRouter] 获取路由失败:', err)
      })
      .finally(() => {
        setRoutesLoaded(true)
      })
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  // 路由未加载完成时显示 loading，不渲染 RouterProvider
  // 这和 Vue 的 NProgress.start() + beforeEach 阻塞效果一致
  if (!routesLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <AppRouterInner />
}

/**
 * 内部路由组件 —— 在路由数据就绪后渲染
 */
function AppRouterInner() {
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)

  const router = useMemo(() => {
    return createBrowserRouter(buildRouterConfig(dynamicRoutes))
  }, [dynamicRoutes])

  // key 强制重新挂载，确保 React Router 重新匹配当前 URL
  return <RouterProvider key={dynamicRoutes.length} router={router} />
}
