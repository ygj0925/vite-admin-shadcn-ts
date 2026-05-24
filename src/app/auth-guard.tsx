import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { useTabsStore } from '@/stores/tabs'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const token = useUserStore((s) => s.token)
  const userInfo = useUserStore((s) => s.userInfo)
  const fetchUserInfo = useUserStore((s) => s.fetchUserInfo)
  const fetchRoutes = useUserStore((s) => s.fetchRoutes)
  const setTabsFromRoutes = useTabsStore((s) => s.setTabsFromRoutes)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token && !userInfo) {
      setLoading(true)
      Promise.all([fetchUserInfo(), fetchRoutes()])
        .then(([, routesRes]) => {
          setTabsFromRoutes(routesRes)
        })
        .finally(() => setLoading(false))
    }
  }, [token, userInfo, fetchUserInfo, fetchRoutes, setTabsFromRoutes])

  if (!token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
