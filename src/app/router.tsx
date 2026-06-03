import { lazy, Suspense, useMemo } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, Outlet } from 'react-router-dom'
import { useRouteStore } from '@/stores/route'
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

  // 后端 component 字段历史上是 Vue 习惯：'system/user/index' 或带 .vue 后缀。
  // React 项目里既有 'a/b/index.tsx' 也有扁平 'a/b.tsx'，按下列顺序匹配。
  const normalized = component
    .replace(/\.vue$/, '')
    .replace(/\/index$/, '')
    .replace(/^views\//, '')  // 兼容带 views/ 前缀的路径
    .replace(/^@\/views\//, '')  // 兼容 @/views/ 前缀
  const candidates = [
    `../views/${normalized}/index.tsx`,
    `../views/${normalized}.tsx`,
  ]
  for (const key of candidates) {
    if (viewModules[key]) {
      return lazy(viewModules[key] as () => Promise<{ default: React.ComponentType }>)
    }
  }
  // 开发环境打印所有候选路径帮助调试
  if (import.meta.env.DEV) {
    console.warn(`[router] 未匹配到视图组件: "${component}" (normalized: "${normalized}")`)
    console.warn(`[router] 尝试的路径:`, candidates)
  }
  // 返回占位页面而不是 null，避免 404
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
    // 适配后端字段：isHidden 或 meta.hidden
    const isHidden = (route as any).isHidden ?? route.meta?.hidden ?? false
    if (isHidden) {
      continue
    }

    // component = "Layout" 表示这是一个父级容器，用 Outlet 渲染子路由
    const isLayoutNode = (route as any).component === 'Layout' || (route as any).component === 'ParentView' || !route.component

    // 后端返回的子菜单 path 通常是绝对路径（如父 "/system" + 子 "/system/user"），
    // react-router v6 嵌套路由要求子 path 相对父；若子以父开头则剥掉前缀。
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

    // 已被静态路由独占的 path（带参版本 / 自定义实现）— 后端的等价菜单跳过
    if (STATIC_OWNED_PATHS.has(absolutePath)) {
      continue
    }

    if (isLayoutNode) {
      // 父级节点：只渲染 children，自身用 Outlet
      if (route.children && route.children.length > 0) {
        result.push({
          path: relativePath,
          element: <Outlet />,
          children: buildDynamicRoutes(route.children, absolutePath),
        })
      }
    } else {
      const Component = resolveComponent(route.component)
      if (!Component) {
        if (import.meta.env.DEV) console.warn(`[router] 跳过路由（组件未匹配）: ${route.path}, component: "${route.component}"`)
        continue
      }
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

// 后端动态菜单中与静态路由 path 完全相同、需要让静态路由优先的项
// 例如 /system/notice/view（详情页用 :id 参数，前端单独写在静态里）
const STATIC_OWNED_PATHS = new Set<string>([
  '/system/notice/view',
])

export function AppRouter() {
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)

  const router = useMemo(() => {
    const dynamic = buildDynamicRoutes(dynamicRoutes)

    return createBrowserRouter([
      {
        path: '/login',
        element: wrap(LoginPage),
      },
      {
        path: '/it-dashboard',
        element: wrap(ITDashboardPage),
      },
      {
        path: '/it-dashboard-tabs',
        element: wrap(ITDashboardTabsPage),
      },
      {
        path: '/pwdExpired',
        element: wrap(PwdExpiredPage),
      },
      {
        path: '/social/callback',
        element: wrap(SocialCallback),
      },
      {
        path: '/corp-select',
        element: wrap(CorpSelectPage),
      },
      {
        path: '/403',
        element: wrap(ForbiddenPage),
      },
      {
        path: '/500',
        element: wrap(ServerErrorPage),
      },
      {
        path: '/',
        element: (
          <AuthGuard>
            <Layout />
          </AuthGuard>
        ),
        children: [
          { index: true, element: <Navigate to="/dashboard/workplace" replace /> },
          { path: 'dashboard/workplace', element: wrap(WorkplacePage) },
          { path: 'dashboard/analysis', element: wrap(AnalysisPage) },
          {
            path: 'about',
            element: wrap(AboutPage),
          },
          {
            path: 'about/document/api',
            element: wrap(ApiDocPage),
          },
          {
            path: 'about/document/changelog',
            element: wrap(ChangelogPage),
          },
          {
            path: 'system/dict/tree',
            element: wrap(DictTreePage),
          },
          {
            path: 'system/notice/view/:id',
            element: wrap(ViewNoticePage),
          },
          {
            path: 'system/role/tree',
            element: wrap(RoleTreePage),
          },
          {
            path: 'system/user/dept',
            element: wrap(UserDeptPage),
          },
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
          {
            path: 'redirect/:path',
            element: wrap(RedirectPage),
          },
          ...dynamic,
          { path: '*', element: wrap(NotFoundPage) },
        ],
      },
    ])
  }, [dynamicRoutes])

  // key 变化时强制重新挂载 RouterProvider，确保 React Router 重新匹配当前 URL
  return <RouterProvider key={dynamicRoutes.length} router={router} />
}
