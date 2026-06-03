import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useUserStore } from '@/stores/user'
import { useRouteStore } from '@/stores/route'
import { useTabsStore } from '@/stores/tabs'
import { removeToken } from '@/lib/auth'

/**
 * 路由守卫 —— 对标 Vue 项目的 router/guard.ts
 *
 * 关键逻辑（和旧项目一致）：
 * 1. 用内存中的 hasRouteFlag 标记，刷新页面后重置为 false
 * 2. 每次进入受保护页面，如果 hasRouteFlag=false，都从 API 重新获取路由
 * 3. 获取成功后设置 hasRouteFlag=true，后续导航不再重复请求
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const token = useUserStore((s) => s.token)
  const userInfo = useUserStore((s) => s.userInfo)
  const fetchUserInfo = useUserStore((s) => s.fetchUserInfo)
  const fetchRoutes = useUserStore((s) => s.fetchRoutes)
  const resetUser = useUserStore((s) => s.reset)
  const setTabsFromRoutes = useTabsStore((s) => s.setTabsFromRoutes)
  const setDynamicRoutes = useRouteStore((s) => s.setDynamicRoutes)
  const firstRoutePath = useRouteStore((s) => s.firstRoutePath)
  const [loading, setLoading] = useState(false)

  // 内存标记，刷新页面后重置 —— 和旧项目的 hasRouteFlag 一致
  const hasRouteFlag = useRef(false)

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

  // 核心逻辑：每次刷新页面（hasRouteFlag=false）都重新请求路由
  useEffect(() => {
    if (!token) return
    // 路由已加载，跳过
    if (hasRouteFlag.current) return

    setLoading(true)
    const tasks: Promise<any>[] = [fetchRoutes()]
    if (!userInfo) tasks.push(fetchUserInfo())

    Promise.all(tasks)
      .then(([routesRes]) => {
        hasRouteFlag.current = true
        if (import.meta.env.DEV) {
          console.log('[AuthGuard] 路由获取成功，数量:', Array.isArray(routesRes) ? routesRes.length : 'NOT_ARRAY')
          if (Array.isArray(routesRes) && routesRes.length > 0) {
            console.log('[AuthGuard] 第一条路由:', JSON.parse(JSON.stringify(routesRes[0])))
          }
        }
        setTabsFromRoutes(routesRes)
      })
      .catch(() => {
        // 请求失败 —— 清除登录状态，跳转登录页
        hasRouteFlag.current = false
        removeToken()
        resetUser()
        window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`
      })
      .finally(() => setLoading(false))
  }, [token, userInfo, fetchUserInfo, fetchRoutes, setTabsFromRoutes, resetUser, setDynamicRoutes, location.pathname])

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
