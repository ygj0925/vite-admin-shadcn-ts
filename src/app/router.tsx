/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy, Suspense, useMemo, useState, useEffect } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, Outlet } from 'react-router-dom'
import { useRouteStore } from '@/stores/route'
import { useUserStore } from '@/stores/user'
import { getUserRoute } from '@/apis/auth'
import { redirectToLogin } from '@/utils/login-redirect'
import { AuthGuard } from './auth-guard'
import { Layout } from '@/layouts'
import type { RouteItem } from '@/types/api'

// Eagerly discover all view modules
// 排除 views/**/components/** — 这些是页面内部的子组件，不是路由组件，
// 避免被静态 import 的全局组件（如 NoticePopup）触发 vite 的 INEFFECTIVE_DYNAMIC_IMPORT 警告
const viewModules = import.meta.glob([
  '../views/**/*.tsx',
  '!../views/**/components/**',
])

// Lazy load pages
const LoginPage = lazy(() => import('@/views/login/index'))
const PwdExpiredPage = lazy(() => import('@/views/login/pwd-expired'))
const SocialCallback = lazy(() => import('@/views/login/social-callback'))
const CorpSelectPage = lazy(() => import('@/views/login/corp-select/index'))
const NotImplementedPage = lazy(() => import('@/views/errors/not-implemented'))
const ForbiddenPage = lazy(() => import('@/views/errors/403'))
const NotFoundPage = lazy(() => import('@/views/errors/404'))
const ServerErrorPage = lazy(() => import('@/views/errors/500'))
const RedirectPage = lazy(() => import('@/views/redirect/index'))
const ITDashboardPage = lazy(() => import('@/views/it-dashboard/index'))
const ITDashboardTabsPage = lazy(() => import('@/views/it-dashboard/tabs/index'))
const ViewNoticePage = lazy(() => import('@/views/system/notice/view'))

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

// 静态独占路径：这些由 router.tsx 注册，buildDynamicRoutes 遇到时跳过
// 仅保留带路径参数 / 不在后端菜单中表达的页面
const STATIC_OWNED_PATHS = new Set<string>(['/system/notice/view'])

function buildDynamicRoutes(routes: RouteItem[], parentPath = ''): any[] {
  const result: any[] = []
  for (const route of routes) {
    // 跳过外链：菜单中的 http(s):// 链接不应注册为路由
    if (route.isExternal || /^https?:\/\//.test(route.path)) continue

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

/**
 * 构建完整的路由配置
 *
 * 静态路由仅保留：
 * - 无需鉴权的页面：login / social-callback / pwd-expired / corp-select / 403 / 500
 * - 框架级独立页面：it-dashboard / it-dashboard-tabs（无 Layout）
 * - 含路径参数的查看页：system/notice/view/:id（后端菜单无法表达 :id 占位）
 * - 中转 / 兜底：redirect/:path / * → NotFound
 *
 * 业务页面（dashboard、about、system 列表页、app 模块等）全部由后端菜单驱动。
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
        { path: 'system/notice/view/:id', element: wrap(ViewNoticePage) },
        { path: 'redirect/:path', element: wrap(RedirectPage) },
        ...dynamic,
        { path: '*', element: wrap(NotFoundPage) },
      ],
    },
    { path: '*', element: wrap(NotFoundPage) },
  ]
}

/**
 * OAuth 回调同步前置（参考 sss-task-web router.beforeEach）
 *
 * 如果当前 URL 是 /?source=&code=… 形式（第三方 OAuth 跳回），
 * 直接 window.location.replace 到 /social/callback，
 * 避免先渲染一帧框架再 useEffect 跳走。
 *
 * 必须在 AppRouter 渲染前同步执行 —— 这里在 module 评估阶段就跑。
 * 返回 true 表示已发起跳转，调用方应短路渲染。
 */
function handleOAuthCallbackSync(): boolean {
  if (typeof window === 'undefined') return false
  const { pathname, search } = window.location
  if (pathname !== '/' || !search) return false
  const params = new URLSearchParams(search)
  if (!params.has('source') || !params.has('code')) return false
  window.location.replace(`/social/callback${search}`)
  return true
}

/**
 * AppRouter —— 对标 Vue 项目的路由初始化流程
 *
 * Vue 流程：router.beforeEach → userStore.getInfo() → routeStore.generateRoutes()
 *          → router.addRoute() → next({...to, replace: true})
 *
 * React 等价：在组件渲染前并行拉取 userInfo 和路由，用完整路由表创建 router，
 *            确保 RouterProvider 首次渲染时就有完整路由表 + userInfo 就绪。
 *
 * 关键差异说明：
 * - OAuth 回调同步前置：避免渲染闪烁
 * - 不再短路 dynamicRoutes 缓存：每次刷新都重新拉取 /auth/user/route（对齐 Vue 版）
 * - 并行 Promise.all([fetchUserInfo, getUserRoute])：两者都就绪才渲染
 * - 任一失败 → reset + redirectToLogin（按环境分流 SSO / corp-select / login）
 * - pwdExpired 在路由初始化阶段命中即 Navigate 到 /pwdExpired
 */
export function AppRouter() {
  // 同步前置：OAuth 回调命中后整页跳走，返回 null 避免后续渲染
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const oauthHandled = useMemo(() => handleOAuthCallbackSync(), [])
  if (oauthHandled) return null

  const token = useUserStore((s) => s.token)
  const fetchUserInfo = useUserStore((s) => s.fetchUserInfo)
  const reset = useUserStore((s) => s.reset)
  const setDynamicRoutes = useRouteStore((s) => s.setDynamicRoutes)
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)
  // 未登录时不需要异步初始化，直接标记为已加载（由 AuthGuard 跳登录）
  const [routesLoaded, setRoutesLoaded] = useState(() => !token)
  const [pwdExpired, setPwdExpired] = useState(false)

  useEffect(() => {
    if (!token) return

    let aborted = false
    // token 变化（重新登录、切换账号）时重置加载状态以触发新一轮初始化
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoutesLoaded(false)
    setPwdExpired(false)

    // 并行拉取用户信息和路由表（与 Vue 版 guard.ts 行为对齐：每次都拉）
    Promise.all([fetchUserInfo(), getUserRoute()])
      .then(([userInfo, routeRes]) => {
        if (aborted) return
        setDynamicRoutes(routeRes.data)
        if (userInfo?.pwdExpired) {
          setPwdExpired(true)
        }
      })
      .catch((err) => {
        if (aborted) return
        console.error('[AppRouter] 初始化失败:', err)
        // 拉取失败（多为 401）→ 清空状态并按环境分流跳登录
        reset()
        const currentPath = window.location.pathname + window.location.search
        // fire-and-forget；redirectToLogin 内部走 window.location.replace
        void redirectToLogin(currentPath)
      })
      .finally(() => {
        if (aborted) return
        setRoutesLoaded(true)
      })

    return () => {
      aborted = true
    }
  }, [token, fetchUserInfo, setDynamicRoutes, reset])

  // 路由未加载完成时显示 loading，不渲染 RouterProvider
  if (!routesLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // 密码过期 → 强制跳转过期页（在路由表注册之前拦截）
  if (pwdExpired && window.location.pathname !== '/pwdExpired') {
    return <Navigate to="/pwdExpired" replace />
  }

  return <AppRouterInner dynamicRoutes={dynamicRoutes} />
}

/**
 * 内部路由组件 —— 在路由数据就绪后渲染
 *
 * 重建策略：
 * - 之前每次刷新都重新拉 /auth/user/route → 即使内容相同也产生新数组引用 → useMemo 重建 router → 当前页面卸载重挂（闪烁）
 * - 现在用路由内容指纹（path + component 列表）做依赖，内容未变则复用同一个 router 实例
 */
function routesFingerprint(routes: RouteItem[]): string {
  const acc: string[] = []
  const walk = (rs: RouteItem[]) => {
    for (const r of rs) {
      acc.push(`${r.path}|${(r as any).component ?? ''}|${r.meta?.hidden ? 1 : 0}`)
      if (r.children?.length) walk(r.children)
    }
  }
  walk(routes)
  return acc.join('#')
}

function AppRouterInner({ dynamicRoutes }: { dynamicRoutes: RouteItem[] }) {
  const fingerprint = useMemo(() => routesFingerprint(dynamicRoutes), [dynamicRoutes])

  const router = useMemo(() => {
    return createBrowserRouter(buildRouterConfig(dynamicRoutes))
    // 依赖 fingerprint：内容真正变化时才重建，引用变化但内容相同则复用
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint])

  return <RouterProvider router={router} />
}
