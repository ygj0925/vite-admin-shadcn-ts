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

function resolveComponent(component: string) {
  if (!component || component === 'Layout') return null

  // Normalize: strip legacy .vue suffix and trailing /index
  const normalized = component
    .replace(/\.vue$/, '')
    .replace(/\/index$/, '')
  const key = `../views/${normalized}/index.tsx`
  if (viewModules[key]) {
    return lazy(viewModules[key] as () => Promise<{ default: React.ComponentType }>)
  }
  // fallback: try without stripping /index
  const key2 = `../views/${normalized}.tsx`
  if (viewModules[key2]) {
    return lazy(viewModules[key2] as () => Promise<{ default: React.ComponentType }>)
  }
  return NotFoundPage
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

function buildDynamicRoutes(routes: RouteItem[]): any[] {
  const result: any[] = []
  for (const route of routes) {
    // 适配后端字段：isHidden 或 meta.hidden
    const isHidden = (route as any).isHidden ?? route.meta?.hidden ?? false
    if (isHidden) continue

    // component = "Layout" 表示这是一个父级容器，用 Outlet 渲染子路由
    const isLayoutNode = (route as any).component === 'Layout' || !route.component

    // 去掉路径开头的 /，react-router 嵌套路由用相对路径
    const relativePath = route.path.replace(/^\//, '')

    if (isLayoutNode) {
      // 父级节点：只渲染 children，自身用 Outlet
      if (route.children && route.children.length > 0) {
        result.push({
          path: relativePath,
          element: <Outlet />,
          children: buildDynamicRoutes(route.children),
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
        routeConfig.children = buildDynamicRoutes(route.children)
      }
      result.push(routeConfig)
    }
  }
  return result
}

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
            path: 'redirect/:path',
            element: wrap(RedirectPage),
          },
          ...dynamic,
        ],
      },
      {
        path: '*',
        element: wrap(NotFoundPage),
      },
    ])
  }, [dynamicRoutes])

  return <RouterProvider router={router} />
}
