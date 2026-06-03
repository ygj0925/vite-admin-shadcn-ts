import { getSocialAuthUrl } from '@/apis/auth'
import { getLoginCorp, setLoginCorp } from '@/lib/auth'
import { envjudge } from '@/utils/env'

/** 已支持的企业微信主体 corp 标识 */
const VALID_CORPS = ['WXCP_PHARMA', 'WXCP_GUOJIAN']

/** 从一段 path（可能含 query）里解析出 corp 参数 */
function parseCorpFromPath(path?: string): string | null {
  if (!path) return null
  const qIndex = path.indexOf('?')
  if (qIndex < 0) return null
  const search = path.slice(qIndex + 1)
  const params = new URLSearchParams(search)
  const corp = (params.get('corp') || '').toUpperCase()
  return corp && VALID_CORPS.includes(corp) ? corp : null
}

/** 根据当前运行环境跳转到合适的登录入口（浏览器→SSO，企业微信→企业选择页） */
export const redirectToLogin = async (fullPath?: string) => {
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
