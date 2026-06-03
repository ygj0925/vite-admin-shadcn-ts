import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

/**
 * 生产环境版本更新检测
 * 通过对比 ETag / Last-Modified 判断是否有新版本部署
 */
export function useVersionCheck() {
  const versionRef = useRef<string | null>(null)
  const checkedRef = useRef(false)

  useEffect(() => {
    if (!import.meta.env.PROD) return

    const checkVersion = async () => {
      try {
        const res = await fetch('/', { cache: 'no-cache' })
        const etag = res.headers.get('etag')
        const lastModified = res.headers.get('last-modified')
        const currentVersion = etag || lastModified || null

        if (!currentVersion) return

        if (!checkedRef.current) {
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

    // 首次检测
    checkVersion()
    // 每 5 分钟检测一次
    const timer = setInterval(checkVersion, 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, [])
}
