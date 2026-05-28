import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send, Loader2 } from 'lucide-react'
import { MessageBubble, type Message } from './message-bubble'
import { PromptPanel } from './prompt-panel'
import type { AiRole } from './role-selector'

interface ChatWindowProps {
  messages: Message[]
  role: AiRole
  onSend: (content: string) => void
  loading: boolean
}

export function ChatWindow({ messages, role, onSend, loading }: ChatWindowProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px'
    }
  }, [input])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    onSend(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt)
    textareaRef.current?.focus()
  }

  const showPrompts = messages.length === 0

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6">
        {messages.length === 0 && !loading ? (
          /* Empty state */
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-3xl',
                'bg-gradient-to-br',
                role.color
              )}
            >
              {role.icon}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium">你好，我是 {role.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
            </div>
            <PromptPanel
              prompts={role.prompts}
              onSelect={handlePromptSelect}
              visible={showPrompts}
            />
          </div>
        ) : (
          /* Message list */
          <div className="space-y-4 py-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-blue-600 text-xs font-medium text-white">
                  AI
                </div>
                <div className="glass glass-dark dark:glass-dark light:glass-light border-white/10 dark:border-white/10 light:border-black/10 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">思考中...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4 md:px-6">
        <div
          className={cn(
            'flex items-end gap-2 rounded-2xl border border-border',
            'glass glass-dark dark:glass-dark light:glass-light',
            'p-2 transition-all focus-within:ring-2 focus-within:ring-primary/30'
          )}
        >
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`向 ${role.name} 提问...`}
            rows={1}
            className="flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-[160px] py-2"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            size="icon"
            className={cn(
              'h-10 w-10 shrink-0 rounded-xl transition-all',
              input.trim()
                ? 'gradient-primary text-white hover:opacity-90'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          AI 生成内容仅供参考，请自行核实
        </p>
      </div>
    </div>
  )
}
