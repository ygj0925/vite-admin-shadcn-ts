import { getSocialAuthUrl } from '@/apis/auth'
import { getLoginCorp, setLoginCorp } from '@/lib/auth'
import { envjudge } from '@/utils/env'

/** 已支持的企业微信主体 corp 标识 */
export const VALID_CORPS = ['WXCP_PHARMA', 'WXCP_GUOJIAN']

/** 白名单：这些路径下不应触发登录重定向（避免无限循环） */
const LOGIN_WHITELIST = ['/login', '/social/callback', '/pwdExpired', '/corp-select']

/** 从一段 path（可能含 query）里解析出 corp 参数 */
export function parseCorpFromPath(path?: string): string | null {
  if (!path) return null
  const qIndex = path.indexOf('?')
  if (qIndex < 0) return null
  const search = path.slice(qIndex + 1)
  const params = new URLSearchParams(search)
  const corp = (params.get('corp') || '').toUpperCase()
  return corp && VALID_CORPS.includes(corp) ? corp : null
}

/** 当前是否处于"已经在登录相关页面"的白名单内 */
function isInLoginWhitelist(): boolean {
  if (typeof window === 'undefined') return false
  return LOGIN_WHITELIST.some((p) => window.location.pathname.startsWith(p))
}

/** 单次跳转去重哨兵 —— 1s 内多次调用只生效一次（防并发 401） */
let isRedirecting = false

/**
 * 根据当前运行环境跳转到合适的登录入口
 * - dev 环境：固定跳 /login（账号密码登录页），方便本地调试
 * - prod 浏览器：调用 /auth/sso 拿到 SSO 授权 URL 后整页跳转
 * - prod 企业微信：跳 /corp-select?corp=xxx&redirect=xxx
 *
 * 复刻自 sss-task-web/src/utils/login-redirect.ts
 */
export const redirectToLogin = async (fullPath?: string): Promise<void> => {
  if (isRedirecting) return
  if (isInLoginWhitelist()) return

  isRedirecting = true
  // 1s 后释放，足够拦截并发 401，但不会卡到下一次正常跳转
  setTimeout(() => {
    isRedirecting = false
  }, 1000)

  // dev 环境强制走 /login，方便本地账号密码登录
  if (!import.meta.env.PROD) {
    const fallback = new URL(`${window.location.origin}/login`)
    if (fullPath) fallback.searchParams.set('redirect', fullPath)
    window.location.replace(fallback.toString())
    return
  }

  const env = envjudge()

  try {
    if (env === 'other') {
      const { data } = await getSocialAuthUrl('sso')
      const loginUrl = new URL(data.authorizeUrl)
      if (fullPath) loginUrl.searchParams.set('redirect', fullPath)
      window.location.replace(loginUrl.toString())
      return
    }
    const loginUrl = new URL(`${window.location.origin}/corp-select`)
    // 优先级：目标链接里携带的 corp > localStorage 缓存
    const corp = parseCorpFromPath(fullPath) || getLoginCorp()
    if (corp) {
      loginUrl.searchParams.set('corp', corp)
      if (parseCorpFromPath(fullPath)) setLoginCorp(corp)
    }
    if (fullPath) loginUrl.searchParams.set('redirect', fullPath)
    window.location.replace(loginUrl.toString())
  } catch {
    const fallback = new URL(`${window.location.origin}/login`)
    if (fullPath) fallback.searchParams.set('redirect', fullPath)
    window.location.replace(fallback.toString())
  }
}
