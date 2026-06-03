import { useEffect, useRef, useState, useCallback } from 'react'
import { getToken } from '@/lib/auth'
import { getUnreadMessageCount } from '@/apis/user/message'

/**
 * 实时未读消息计数 Hook
 * 优先使用 WebSocket，断线时回退到轮询
 */
export function useMessageCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const token = getToken()

  const fetchCount = useCallback(async () => {
    try {
      const res = await getUnreadMessageCount()
      setUnreadCount(res.data?.total ?? 0)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!token) return

    // 获取初始计数
    fetchCount()

    // 尝试 WebSocket 连接
    const wsUrl = import.meta.env.VITE_API_WS_URL
    if (wsUrl) {
      try {
        const ws = new WebSocket(`${wsUrl}/websocket?token=${token}`)
        wsRef.current = ws

        ws.onmessage = (event) => {
          const count = parseInt(event.data, 10)
          if (!isNaN(count)) {
            setUnreadCount(count)
          }
        }

        ws.onerror = () => {
          // WebSocket 失败，回退到轮询
          startPolling()
        }

        ws.onclose = () => {
          startPolling()
        }
      } catch {
        startPolling()
      }
    } else {
      startPolling()
    }

    function startPolling() {
      if (pollTimerRef.current) return
      pollTimerRef.current = setInterval(fetchCount, 30000)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [token, fetchCount])

  return { unreadCount, refresh: fetchCount }
}
