import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { PageTransition } from '@/components/app/page-transition'
import { RoleSelector, AI_ROLES, type AiRole } from './components/role-selector'
import { ChatList, type ChatSession } from './components/chat-list'
import { ChatWindow } from './components/chat-window'
import type { Message } from './components/message-bubble'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// Simulated AI responses by role
const AI_RESPONSES: Record<string, string[]> = {
  general: [
    '这是一个很好的问题！让我来为你分析一下...\n\n首先，从宏观角度来看，我们需要考虑几个关键因素。其次，实际执行中会遇到一些挑战，但都有对应的解决方案。',
    '根据我的了解，这个话题可以从以下几个方面来理解：\n\n1. 基础概念：核心原理是什么\n2. 实际应用：如何在日常中使用\n3. 进阶技巧：更深入的理解',
  ],
  coder: [
    '这是个不错的技术问题！以下是实现方案：\n\n```typescript\nfunction solution() {\n  // 核心逻辑\n  return result\n}\n```\n\n关键点在于正确处理异步流程和错误边界。',
    '在处理这类问题时，建议使用以下模式：\n\n1. 先定义清晰的类型接口\n2. 实现核心业务逻辑\n3. 添加错误处理和边界检查\n4. 编写必要的单元测试',
  ],
  writer: [
    '好的，让我帮你润色一下这段文字。以下是修改建议：\n\n原文的核心观点很清晰，但在表达上可以更加生动。建议使用更具体的描写来增强读者的代入感。',
    '这是一个很好的创作方向！以下是一些改进建议：\n\n- 开头可以更有冲击力\n- 中间段落增加具体案例\n- 结尾留下思考空间\n\n整体来说，基础框架已经很好了。',
  ],
}

function getAiResponse(roleId: string): string {
  const responses = AI_RESPONSES[roleId] || AI_RESPONSES.general
  return responses[Math.floor(Math.random() * responses.length)]
}

export default function AppAiChat() {
  const [selectedRole, setSelectedRole] = useState<AiRole>(AI_ROLES[0])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const messages: Message[] = activeSession
    ? activeSession.messages.map((m, i) => ({
        id: `${activeSessionId}-${i}`,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: activeSession.updatedAt - (activeSession.messages.length - i) * 1000,
      }))
    : []

  const handleNewChat = useCallback(() => {
    const id = generateId()
    const now = Date.now()
    const newSession: ChatSession = {
      id,
      title: `${selectedRole.name} - 新对话`,
      roleId: selectedRole.id,
      createdAt: now,
      updatedAt: now,
      messages: [],
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(id)
  }, [selectedRole])

  const handleDeleteChat = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id))
      if (activeSessionId === id) {
        setActiveSessionId(null)
      }
    },
    [activeSessionId]
  )

  const handleSend = useCallback(
    async (content: string) => {
      const sessionId = activeSessionId || (() => {
        handleNewChat()
        return sessions[0]?.id || null
      })()

      if (!sessionId) return

      // Add user message
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s
          return {
            ...s,
            title: s.messages.length === 0 ? content.slice(0, 30) : s.title,
            messages: [...s.messages, { role: 'user', content }],
            updatedAt: Date.now(),
          }
        })
      )

      setLoading(true)

      // Simulate AI response delay
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))

      const aiContent = getAiResponse(selectedRole.id)

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s
          return {
            ...s,
            messages: [...s.messages, { role: 'assistant', content: aiContent }],
            updatedAt: Date.now(),
          }
        })
      )
      setLoading(false)
    },
    [activeSessionId, selectedRole, sessions, handleNewChat]
  )

  const handleRoleSelect = useCallback((role: AiRole) => {
    setSelectedRole(role)
  }, [])

  return (
    <PageTransition className="h-full flex flex-col">
      {/* Role selector bar */}
      <div className="shrink-0 border-b border-border p-4">
        <RoleSelector
          selectedRoleId={selectedRole.id}
          onSelect={handleRoleSelect}
        />
      </div>

      {/* Main content: sidebar + chat */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <div
          className={cn(
            'flex flex-col border-r border-border transition-all duration-300',
            sidebarOpen ? 'w-64 shrink-0' : 'w-0 overflow-hidden'
          )}
        >
          <div className="flex items-center justify-between p-3">
            <span className="text-xs font-medium text-muted-foreground">对话记录</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSidebarOpen(false)}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
          <Separator />
          <div className="flex-1 min-h-0">
            <ChatList
              sessions={sessions}
              activeId={activeSessionId}
              onSelect={setActiveSessionId}
              onNew={handleNewChat}
              onDelete={handleDeleteChat}
            />
          </div>
        </div>

        {/* Chat area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Sidebar toggle */}
          {!sidebarOpen && (
            <div className="shrink-0 px-2 pt-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex-1 min-h-0">
            <ChatWindow
              messages={messages}
              role={selectedRole}
              onSend={handleSend}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
