import { useEffect } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { useRouteStore } from '@/stores/route'
import { redirectToLogin } from '@/utils/login-redirect'

/**
 * 路由守卫 —— 负责：
 * 1. 未登录 → redirectToLogin（按环境分流：浏览器 SSO / 企业微信 corp-select / dev /login）
 * 2. corp 参数清理（已登录时把 URL 上的 corp 剥掉）
 * 3. 根路径重定向到第一个菜单
 *
 * 注意：
 * - 用户信息和路由获取已在 AppRouter 中完成
 * - 密码过期检测在 AppRouter 中前置处理
 * - OAuth 回调（?source=&code=）已在 AppRouter 渲染前同步前置
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const token = useUserStore((s) => s.token)
  const firstRoutePath = useRouteStore((s) => s.firstRoutePath)

  // 未登录 → 按环境分流跳转
  useEffect(() => {
    if (!token) {
      const fullPath = location.pathname + location.search
      void redirectToLogin(fullPath)
    }
  }, [token, location.pathname, location.search])

  // corp 参数清理（已登录时把 URL 上的 corp 剥掉，保持 URL 干净）
  useEffect(() => {
    if (token && searchParams.has('corp')) {
      const params = new URLSearchParams(searchParams)
      params.delete('corp')
      const newSearch = params.toString()
      const newUrl = newSearch ? `${location.pathname}?${newSearch}` : location.pathname
      window.history.replaceState(null, '', newUrl)
    }
  }, [token, location.pathname, searchParams])

  // 未登录时渲染 null —— 等 redirectToLogin 整页跳转完成
  if (!token) {
    return null
  }

  // 根路径重定向到第一个菜单
  if (location.pathname === '/' && firstRoutePath && firstRoutePath !== '/') {
    return <Navigate to={firstRoutePath} replace />
  }

  return <>{children}</>
}

