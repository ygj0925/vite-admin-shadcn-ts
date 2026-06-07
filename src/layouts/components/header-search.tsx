import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, History, FileText, ArrowRight, X } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useRouteStore } from '@/stores/route'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

const HISTORY_KEY = 'continew-search-history'
const MAX_HISTORY = 5

function getHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

function saveHistory(items: string[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
}

export function HeaderSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const flatRoutes = useRouteStore((s) => s.flatRoutes)
  const inputRef = useRef<HTMLInputElement>(null)

  const [history, setHistory] = useState<string[]>(getHistory)

  // 搜索结果
  const results = query.trim()
    ? flatRoutes.filter((r) => {
        const title = r.meta?.title || r.title || ''
        return title.toLowerCase().includes(query.toLowerCase()) && !r.meta?.hidden
      })
    : []

  // 历史记录匹配
  const historyItems = query.trim()
    ? []
    : history.map((path) => flatRoutes.find((r) => r.path === path)).filter(Boolean)

  const displayItems = query.trim() ? results : historyItems
  const maxIndex = displayItems.length - 1

  const handleSelect = useCallback(
    (path: string, title?: string) => {
      const newHistory = [path, ...history.filter((h) => h !== path)].slice(0, MAX_HISTORY)
      saveHistory(newHistory)
      setHistory(newHistory)

      navigate(path)
      setOpen(false)
      setQuery('')
      setActiveIndex(0)
    },
    [history, navigate]
  )

  const clearHistory = () => {
    saveHistory([])
    setHistory([])
  }

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, maxIndex))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && displayItems[activeIndex]) {
      e.preventDefault()
      const item = displayItems[activeIndex] as any
      handleSelect(item.path, item.meta?.title || item.title)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Ctrl+K 全局快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // 打开时聚焦
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setActiveIndex(0)
    }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-8 items-center gap-2 rounded-lg',
          'border border-border/50 bg-background/50',
          'px-2.5 sm:px-3 text-sm text-muted-foreground',
          'transition-all duration-200',
          'hover:bg-accent hover:text-foreground',
          'active:scale-95'
        )}
      >
        <Search className="h-3.5 w-3.5" />
        {!isMobile && <span className="hidden lg:inline">搜索</span>}
        {!isMobile && (
          <kbd className={cn(
            'pointer-events-none hidden h-5 select-none items-center',
            'gap-0.5 rounded border border-border bg-muted px-1.5',
            'font-mono text-[10px] font-medium lg:inline-flex'
          )}>
            Ctrl K
          </kbd>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="overflow-hidden p-0 gap-0 sm:max-w-sm">
          {/* 搜索输入区 */}
          <div className="flex items-center gap-2.5 border-b border-border/50 px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="搜索菜单..."
              className="flex h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setActiveIndex(0); inputRef.current?.focus() }}
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* 结果区 */}
          <div className="max-h-64 overflow-auto py-1.5 px-1.5">
            {/* 历史记录标题 */}
            {!query.trim() && historyItems.length > 0 && (
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[11px] font-medium text-muted-foreground">搜索历史</span>
                <button
                  onClick={clearHistory}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  清除
                </button>
              </div>
            )}

            {/* 搜索结果标题 */}
            {query.trim() && results.length > 0 && (
              <div className="px-2 py-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  搜索结果 ({results.length})
                </span>
              </div>
            )}

            {/* 无结果 */}
            {query.trim() && results.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">无匹配结果</div>
            )}

            {/* 无历史 */}
            {!query.trim() && historyItems.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">输入菜单名称搜索</div>
            )}

            {/* 结果列表 */}
            {displayItems.map((item: any, index: number) => {
              const title = item.meta?.title || item.title || ''
              const active = index === activeIndex
              return (
                <button
                  key={item.path}
                  onClick={() => handleSelect(item.path, title)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors',
                    active
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  {query.trim() ? (
                    <FileText className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-primary' : '')} />
                  ) : (
                    <History className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-primary' : '')} />
                  )}
                  <span className="flex-1 truncate">{title}</span>
                  <ArrowRight className={cn(
                    'h-3 w-3 shrink-0 transition-opacity',
                    active ? 'opacity-60' : 'opacity-0 group-hover:opacity-40'
                  )} />
                </button>
              )
            })}
          </div>

          {/* 底部提示 */}
          {displayItems.length > 0 && (
            <div className="flex items-center gap-3 border-t border-border/50 px-3 py-1.5 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">↑↓</kbd>
                导航
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">↵</kbd>
                选择
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">Esc</kbd>
                关闭
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
