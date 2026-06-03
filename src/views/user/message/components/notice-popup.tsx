import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getUnreadNoticeIds, getMessageById, readMessage, type Message } from '@/apis/user/message'

export function NoticePopup() {
  const [open, setOpen] = useState(false)
  const [noticeIds, setNoticeIds] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentNotice, setCurrentNotice] = useState<Message | null>(null)
  const [loading, setLoading] = useState(false)
  const [cache, setCache] = useState<Record<number, Message>>({})

  const fetchNoticeDetail = useCallback(
    async (id: number) => {
      // 先查缓存
      if (cache[id]) {
        setCurrentNotice(cache[id])
        return
      }
      setLoading(true)
      try {
        const res = await getMessageById(id)
        const msg = res.data
        setCurrentNotice(msg)
        setCache((prev) => ({ ...prev, [id]: msg }))
      } catch {
        setCurrentNotice(null)
      } finally {
        setLoading(false)
      }
    },
    [cache]
  )

  const fetchUnreadNotices = useCallback(async () => {
    try {
      const res = await getUnreadNoticeIds('POPUP')
      const ids = res.data || []
      if (ids.length > 0) {
        setNoticeIds(ids)
        setCurrentIndex(0)
        setOpen(true)
      }
    } catch {
      // ignore
    }
  }, [])

  // 延迟 1 秒后检查未读公告
  useEffect(() => {
    const timer = setTimeout(fetchUnreadNotices, 1000)
    return () => clearTimeout(timer)
  }, [fetchUnreadNotices])

  // 当前索引变化时获取详情
  useEffect(() => {
    if (noticeIds.length > 0 && noticeIds[currentIndex]) {
      fetchNoticeDetail(noticeIds[currentIndex])
    }
  }, [currentIndex, noticeIds, fetchNoticeDetail])

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  const handleNext = () => {
    if (currentIndex < noticeIds.length - 1) setCurrentIndex(currentIndex + 1)
  }

  const handleClose = async () => {
    // 标记当前公告为已读
    if (currentNotice) {
      try {
        await readMessage([String(currentNotice.id)])
      } catch {
        // ignore
      }
    }
    setOpen(false)
  }

  const handleReadAll = async () => {
    try {
      await readMessage(noticeIds.map(String))
    } catch {
      // ignore
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{currentNotice?.title || '公告通知'}</span>
            <button onClick={handleClose} className="rounded-lg p-1 hover:bg-accent transition-colors">
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[200px] py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : currentNotice ? (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                {currentNotice.createTime}
              </div>
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: currentNotice.content }}
              />
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">暂无内容</div>
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
              上一条
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {noticeIds.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex >= noticeIds.length - 1}
            >
              下一条
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" onClick={handleReadAll}>
            全部已读
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
