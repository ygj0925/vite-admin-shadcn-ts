import { useEffect } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { useRouteStore } from '@/stores/route'

/**
 * 路由守卫 —— 负责：
 * 1. 未登录跳转
 * 2. OAuth 回调检测
 * 3. corp 参数清理
 * 4. 根路径重定向到第一个菜单
 *
 * 注意：
 * - 用户信息和路由获取已在 AppRouter 中完成（对标 Vue 的 guard.ts 流程）
 * - 密码过期检测在 AppRouter 中前置处理，这里不再重复
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = useUserStore((s) => s.token)
  const firstRoutePath = useRouteStore((s) => s.firstRoutePath)

  // OAuth 回调检测（SPA 导航，不刷新页面）
  useEffect(() => {
    if (location.pathname === '/' && searchParams.has('source') && searchParams.has('code')) {
      navigate(`/social/callback?${searchParams.toString()}`, { replace: true })
    }
  }, [location.pathname, searchParams, navigate])

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

  // 未登录 → 跳转登录页
  if (!token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  // 根路径重定向到第一个菜单
  if (location.pathname === '/' && firstRoutePath && firstRoutePath !== '/') {
    return <Navigate to={firstRoutePath} replace />
  }

  return <>{children}</>
}
