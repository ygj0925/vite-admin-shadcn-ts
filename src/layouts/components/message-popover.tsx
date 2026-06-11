import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getMessagePage, readAllMessages, type Message } from '@/apis/user/message'
import { cn } from '@/lib/utils'

interface MessagePopoverProps {
  unreadCount: number
  onRead?: () => void
}

export function MessagePopover({ unreadCount, onRead }: MessagePopoverProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await getMessagePage({
        page: 1,
        size: 5,
        sort: ['createTime,desc'],
      })
      setMessages(res.data?.list ?? [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchMessages()
  }, [open])

  const handleReadAll = async () => {
    try {
      await readAllMessages()
      toast.success('已全部标为已读')
      setMessages((prev) => prev.map((m) => ({ ...m, status: 1 })))
      onRead?.()
    } catch {
      // ignore
    }
  }

  const handleClickMessage = (_msg: Message) => {
    setOpen(false)
    navigate('/user/message')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={cn(
          // navy header 风格：9×9 圆角 + 蓝白配色 + 红色徽标
          'relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
          'text-blue-200 hover:text-white hover:bg-white/10'
        )}>
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className={cn(
              'absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full',
              'text-white text-[10px] font-bold flex items-center justify-center'
            )}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <span className="text-sm font-semibold">消息通知</span>
          <button
            onClick={handleReadAll}
            className={cn(
              'flex items-center gap-1 text-xs text-muted-foreground',
              'transition-colors hover:text-foreground'
            )}
          >
            <CheckCheck className="h-3 w-3" />
            全部已读
          </button>
        </div>
        <ScrollArea className="max-h-80">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : messages.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">暂无消息</div>
          ) : (
            <div className="divide-y divide-border/50">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleClickMessage(msg)}
                  className={cn(
                    'flex w-full flex-col gap-1 px-4 py-3 text-left',
                    'transition-colors hover:bg-accent'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        msg.status === 0 ? 'bg-primary' : 'bg-transparent'
                      )}
                    />
                    <span className="flex-1 truncate text-sm">{msg.title}</span>
                  </div>
                  <span className="pl-3.5 text-xs text-muted-foreground">{msg.createTime}</span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="border-t border-border/50 px-4 py-2 text-center">
          <button
            onClick={() => {
              setOpen(false)
              navigate('/user/message')
            }}
            className="text-xs text-primary hover:underline"
          >
            查看更多
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
