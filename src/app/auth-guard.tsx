import { useEffect, useState } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useUserStore } from '@/stores/user'
import { useRouteStore } from '@/stores/route'
import { useTabsStore } from '@/stores/tabs'
import { removeToken } from '@/lib/auth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const token = useUserStore((s) => s.token)
  const userInfo = useUserStore((s) => s.userInfo)
  const fetchUserInfo = useUserStore((s) => s.fetchUserInfo)
  const fetchRoutes = useUserStore((s) => s.fetchRoutes)
  const resetUser = useUserStore((s) => s.reset)
  const setTabsFromRoutes = useTabsStore((s) => s.setTabsFromRoutes)
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)
  const hasHydrated = useRouteStore((s) => s._hasHydrated)
  const firstRoutePath = useRouteStore((s) => s.firstRoutePath)
  const [loading, setLoading] = useState(false)

  // OAuth 回调检测：根路径带 source + code 参数 → 跳转 /social/callback
  useEffect(() => {
    if (location.pathname === '/' && searchParams.has('source') && searchParams.has('code')) {
      const qs = searchParams.toString()
      window.location.replace(`/social/callback?${qs}`)
    }
  }, [location.pathname, searchParams])

  // corp 参数清理
  useEffect(() => {
    if (token && searchParams.has('corp')) {
      const params = new URLSearchParams(searchParams)
      params.delete('corp')
      const newSearch = params.toString()
      const newUrl = newSearch ? `${location.pathname}?${newSearch}` : location.pathname
      window.history.replaceState(null, '', newUrl)
    }
  }, [token, location.pathname, searchParams])

  useEffect(() => {
    if (!token) return
    // Wait for Zustand hydration before deciding to fetch
    if (!hasHydrated) return
    // Fetch routes if not yet loaded into routeStore (covers both first login and page refresh)
    if (dynamicRoutes.length === 0) {
      setLoading(true)
      const tasks: Promise<any>[] = [fetchRoutes()]
      if (!userInfo) tasks.push(fetchUserInfo())
      Promise.all(tasks)
        .then(([routesRes]) => {
          setTabsFromRoutes(routesRes)
        })
        .catch(() => {
          // Route fetch failed — clear auth state and redirect to login
          removeToken()
          resetUser()
          window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`
        })
        .finally(() => setLoading(false))
    }
  }, [token, userInfo, dynamicRoutes.length, hasHydrated, fetchUserInfo, fetchRoutes, setTabsFromRoutes, resetUser, location.pathname])

  // 密码过期检测
  useEffect(() => {
    if (userInfo?.pwdExpired && location.pathname !== '/pwdExpired') {
      toast.warning('密码已过期，请修改密码')
      window.location.href = '/pwdExpired'
    }
  }, [userInfo?.pwdExpired, location.pathname])

  if (!token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  // Show spinner while waiting for hydration or route fetch
  if (!hasHydrated || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // 根路径重定向到第一个菜单
  if (location.pathname === '/' && firstRoutePath && firstRoutePath !== '/') {
    return <Navigate to={firstRoutePath} replace />
  }

  return <>{children}</>
}
