import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ChatSession {
  id: string
  title: string
  roleId: string
  createdAt: number
  updatedAt: number
  messages: { role: string; content: string }[]
}

interface ChatListProps {
  sessions: ChatSession[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export function ChatList({ sessions, activeId, onSelect, onNew, onDelete }: ChatListProps) {
  return (
    <div className="flex h-full flex-col">
      {/* New chat button */}
      <div className="p-3">
        <Button
          onClick={onNew}
          className="w-full rounded-xl gradient-primary text-white hover:opacity-90 transition-opacity"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          新建对话
        </Button>
      </div>

      {/* Chat list */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 opacity-40" />
              <p className="text-xs">暂无对话</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelect(session.id)}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all',
                  activeId === session.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted/50 text-foreground'
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-50" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{session.title || '新对话'}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(session.updatedAt).toLocaleString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(session.id)
                  }}
                  className="shrink-0 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
