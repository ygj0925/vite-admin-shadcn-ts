import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { useRouteStore } from '@/stores/route'
import { useTabsStore } from '@/stores/tabs'
import { removeToken } from '@/lib/auth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const token = useUserStore((s) => s.token)
  const userInfo = useUserStore((s) => s.userInfo)
  const fetchUserInfo = useUserStore((s) => s.fetchUserInfo)
  const fetchRoutes = useUserStore((s) => s.fetchRoutes)
  const resetUser = useUserStore((s) => s.reset)
  const setTabsFromRoutes = useTabsStore((s) => s.setTabsFromRoutes)
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)
  const hasHydrated = useRouteStore((s) => s._hasHydrated)
  const [loading, setLoading] = useState(false)

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

  return <>{children}</>
}
