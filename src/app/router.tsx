import { lazy, Suspense, useMemo } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
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

function resolveComponent(component: string) {
  const key = `../views/${component}/index.tsx`
  if (viewModules[key]) {
    return lazy(viewModules[key] as () => Promise<{ default: React.ComponentType }>)
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

function buildDynamicRoutes(routes: RouteItem[]): any[] {
  const result: any[] = []
  for (const route of routes) {
    if (route.meta?.hidden) continue
    const Component = resolveComponent(route.component)
    const routeConfig: any = {
      path: route.path,
      element: (
        <Suspense fallback={<Loading />}>
          <Component />
        </Suspense>
      ),
    }
    if (route.children && route.children.length > 0) {
      routeConfig.children = buildDynamicRoutes(route.children)
    }
    result.push(routeConfig)
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
        element: (
          <Suspense fallback={<Loading />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: '/pwdExpired',
        element: (
          <Suspense fallback={<Loading />}>
            <PwdExpiredPage />
          </Suspense>
        ),
      },
      {
        path: '/social/callback',
        element: (
          <Suspense fallback={<Loading />}>
            <SocialCallback />
          </Suspense>
        ),
      },
      {
        path: '/403',
        element: (
          <Suspense fallback={<Loading />}>
            <ForbiddenPage />
          </Suspense>
        ),
      },
      {
        path: '/500',
        element: (
          <Suspense fallback={<Loading />}>
            <ServerErrorPage />
          </Suspense>
        ),
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
          {
            path: 'about',
            element: (
              <Suspense fallback={<Loading />}>
                <AboutPage />
              </Suspense>
            ),
          },
          {
            path: 'about/document/api',
            element: (
              <Suspense fallback={<Loading />}>
                <ApiDocPage />
              </Suspense>
            ),
          },
          {
            path: 'about/document/changelog',
            element: (
              <Suspense fallback={<Loading />}>
                <ChangelogPage />
              </Suspense>
            ),
          },
          {
            path: 'redirect/:path',
            element: (
              <Suspense fallback={<Loading />}>
                <RedirectPage />
              </Suspense>
            ),
          },
          ...dynamic,
        ],
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<Loading />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ])
  }, [dynamicRoutes])

  return <RouterProvider router={router} />
}
