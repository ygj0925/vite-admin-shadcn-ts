import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'

/**
 * 生产环境版本更新检测
 * 通过对比 ETag / Last-Modified 判断是否有新版本部署
 */
export function useVersionCheck() {
  const location = useLocation()
  const versionRef = useRef<string | null>(null)
  const checkedRef = useRef(false)

  const checkVersion = async () => {
    if (!import.meta.env.PROD) return

    try {
      const res = await fetch('/', { cache: 'no-cache' })
      const etag = res.headers.get('etag')
      const lastModified = res.headers.get('last-modified')
      const currentVersion = etag || lastModified || null

      if (!currentVersion) return

      if (!checkedRef.current) {
        // 首次记录版本号
        versionRef.current = currentVersion
        checkedRef.current = true
        return
      }

      if (versionRef.current && currentVersion !== versionRef.current) {
        toast('系统已更新', {
          description: '检测到新版本，建议刷新页面获取最新功能。',
          duration: 0,
          action: {
            label: '刷新',
            onClick: () => window.location.reload(),
          },
        })
        versionRef.current = currentVersion
      }
    } catch {
      // ignore network errors
    }
  }

  // 路由变化时检测
  useEffect(() => {
    checkVersion()
  }, [location.pathname])

  // 定时检测（每 5 分钟）
  useEffect(() => {
    if (!import.meta.env.PROD) return
    const timer = setInterval(checkVersion, 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, [])
}
