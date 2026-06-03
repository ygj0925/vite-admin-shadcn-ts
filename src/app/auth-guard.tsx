import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useUserStore } from '@/stores/user'
import { useRouteStore } from '@/stores/route'
import { useTabsStore } from '@/stores/tabs'
import { removeToken } from '@/lib/auth'

/**
 * 路由守卫 —— 负责：
 * 1. 未登录跳转
 * 2. 密码过期检测
 * 3. OAuth 回调检测
 * 4. corp 参数清理
 * 5. 根路径重定向到第一个菜单
 *
 * 注意：路由获取已移到 AppRouter 中处理（对标 Vue 的 guard.ts 流程）
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const token = useUserStore((s) => s.token)
  const userInfo = useUserStore((s) => s.userInfo)
  const fetchUserInfo = useUserStore((s) => s.fetchUserInfo)
  const dynamicRoutes = useRouteStore((s) => s.dynamicRoutes)
  const firstRoutePath = useRouteStore((s) => s.firstRoutePath)
  const [loading, setLoading] = useState(false)

  // OAuth 回调检测
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

  // 获取用户信息（如果还没有的话）
  useEffect(() => {
    if (!token) return
    if (userInfo) return
    if (dynamicRoutes.length === 0) return // 等路由先加载

    setLoading(true)
    fetchUserInfo()
      .catch(() => {
        removeToken()
        window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`
      })
      .finally(() => setLoading(false))
  }, [token, userInfo, dynamicRoutes.length, fetchUserInfo, location.pathname])

  // 密码过期检测
  useEffect(() => {
    if (userInfo?.pwdExpired && location.pathname !== '/pwdExpired') {
      toast.warning('密码已过期，请修改密码')
      window.location.href = '/pwdExpired'
    }
  }, [userInfo?.pwdExpired, location.pathname])

  // 未登录 → 跳转登录页
  if (!token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  // 加载中 → 显示 spinner
  if (loading) {
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
