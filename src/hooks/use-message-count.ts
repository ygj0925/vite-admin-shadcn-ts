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

    let cancelled = false

    const startPolling = () => {
      // 关键：先清掉旧的，再起新的；ws.onerror/onclose 双触发也只会有一个 timer
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
      }
      pollTimerRef.current = setInterval(() => {
        if (!cancelled) fetchCount()
      }, 300000)
    }

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

    return () => {
      cancelled = true
      if (wsRef.current) {
        // 主动关闭前清掉回调，避免触发 onclose → startPolling 的"僵尸定时器"
        wsRef.current.onclose = null
        wsRef.current.onerror = null
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
