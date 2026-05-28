import { useState, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, Plus, Clock, MapPin } from 'lucide-react'
import { PageTransition } from '@/components/app/page-transition'
import { GlassCard } from '@/components/app/glass-card'
import { GradientButton } from '@/components/app/gradient-button'
import {
  CalendarView,
  CATEGORY_CONFIG,
  type CalendarEvent,
  type EventCategory,
} from './components/calendar-view'
import {
  EventModal,
  type EventFormData,
} from './components/event-modal'

// -- Sample data (would normally come from API) --
function generateSampleEvents(): CalendarEvent[] {
  const today = new Date()
  const y = today.getFullYear()
  const m = today.getMonth()
  const d = today.getDate()

  function key(offset: number): string {
    const dt = new Date(y, m, d + offset)
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    return `${dt.getFullYear()}-${mm}-${dd}`
  }

  return [
    {
      id: '1',
      title: '项目周会',
      date: key(0),
      time: '09:30',
      endTime: '10:30',
      category: 'work',
      description: '本周进度汇报与下周计划讨论',
    },
    {
      id: '2',
      title: '需求评审',
      date: key(0),
      time: '14:00',
      endTime: '15:30',
      category: 'work',
      description: '新版本功能需求评审会议',
    },
    {
      id: '3',
      title: '健身',
      date: key(0),
      time: '18:00',
      endTime: '19:00',
      category: 'personal',
      description: '晚间有氧运动',
    },
    {
      id: '4',
      title: '提交季度报告',
      date: key(1),
      time: '10:00',
      endTime: '11:00',
      category: 'important',
      description: 'Q2 季度总结报告截止',
    },
    {
      id: '5',
      title: '客户拜访',
      date: key(2),
      time: '14:30',
      endTime: '16:00',
      category: 'work',
      description: '拜访星河科技讨论合作方案',
    },
    {
      id: '6',
      title: '续费提醒',
      date: key(3),
      time: '09:00',
      endTime: '09:30',
      category: 'reminder',
      description: '云服务器年费续费',
    },
    {
      id: '7',
      title: '代码审查',
      date: key(1),
      time: '15:00',
      endTime: '16:00',
      category: 'work',
      description: '审查 PR #128 用户模块重构',
    },
    {
      id: '8',
      title: '团队聚餐',
      date: key(5),
      time: '18:30',
      endTime: '20:30',
      category: 'personal',
      description: '庆祝项目上线聚餐',
    },
    {
      id: '9',
      title: '技术分享会',
      date: key(7),
      time: '14:00',
      endTime: '15:30',
      category: 'work',
      description: 'React 19 新特性分享',
    },
    {
      id: '10',
      title: '牙科预约',
      date: key(10),
      time: '10:00',
      endTime: '11:00',
      category: 'important',
      description: '半年一次的口腔检查',
    },
  ]
}

function formatDisplayDate(date: Date): string {
  const today = new Date()
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diff = Math.round((target.getTime() - todayStart.getTime()) / 86400000)

  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === -1) return '昨天'
  if (diff > 0 && diff <= 7) return `${diff} 天后`

  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

export default function AppSchedule() {
  const [events, setEvents] = useState<CalendarEvent[]>(generateSampleEvents)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  const selectedDateKey = useMemo(() => {
    const y = selectedDate.getFullYear()
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const d = String(selectedDate.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }, [selectedDate])

  // Events for the selected date
  const selectedDayEvents = useMemo(
    () =>
      events
        .filter((e) => e.date === selectedDateKey)
        .sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [events, selectedDateKey]
  )

  // Upcoming events (from today onwards, excluding selected date, limit 8)
  const upcomingEvents = useMemo(() => {
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return events
      .filter((e) => e.date >= todayKey && e.date !== selectedDateKey)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
      .slice(0, 8)
  }, [events, selectedDateKey])

  const handleCreateEvent = useCallback(() => {
    setEditingEvent(null)
    setModalOpen(true)
  }, [])

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event)
    setModalOpen(true)
  }, [])

  const handleSaveEvent = useCallback(
    (data: EventFormData) => {
      if (editingEvent) {
        // Update existing
        setEvents((prev) =>
          prev.map((e) =>
            e.id === editingEvent.id
              ? {
                  ...e,
                  title: data.title,
                  date: data.date,
                  time: data.time,
                  endTime: data.endTime,
                  category: data.category,
                  description: data.description,
                }
              : e
          )
        )
      } else {
        // Create new
        const newEvent: CalendarEvent = {
          id: Date.now().toString(),
          title: data.title,
          date: data.date,
          time: data.time,
          endTime: data.endTime,
          category: data.category,
          description: data.description,
        }
        setEvents((prev) => [...prev, newEvent])
      }
    },
    [editingEvent]
  )

  const handleDeleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return (
    <PageTransition className="p-4 md:p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">日程管理</h1>
            <p className="text-sm text-muted-foreground">管理你的日程安排</p>
          </div>
        </div>
        <GradientButton onClick={handleCreateEvent}>
          <Plus className="mr-1 h-4 w-4" />
          新建日程
        </GradientButton>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Left column: Calendar */}
        <div className="space-y-6">
          <GlassCard className="p-4">
            <CalendarView
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              events={events}
            />
          </GlassCard>

          {/* Category legend */}
          <GlassCard title="分类说明">
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(CATEGORY_CONFIG) as [EventCategory, typeof CATEGORY_CONFIG.work][]).map(
                ([key, config]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className={cn('h-2.5 w-2.5 rounded-full', config.dot)} />
                    <span className="text-muted-foreground">{config.label}</span>
                  </div>
                )
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right column: Events */}
        <div className="space-y-6">
          {/* Selected day events */}
          <GlassCard title={`${formatDisplayDate(selectedDate)}的日程`}>
            {selectedDayEvents.length > 0 ? (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-0">
                  {selectedDayEvents.map((event, i) => {
                    const config = CATEGORY_CONFIG[event.category]
                    return (
                      <div key={event.id}>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="flex w-full items-start gap-3 py-3 text-left transition-colors hover:bg-muted/50 rounded-lg px-2 -mx-2"
                        >
                          <div
                            className={cn(
                              'mt-0.5 flex h-2 w-2 shrink-0 rounded-full',
                              config.dot
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">
                                {event.title}
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                                  config.bg,
                                  config.color
                                )}
                              >
                                {config.label}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              {event.time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {event.time}
                                  {event.endTime ? ` - ${event.endTime}` : ''}
                                </span>
                              )}
                            </div>
                            {event.description && (
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </button>
                        {i < selectedDayEvents.length - 1 && <Separator />}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CalendarDays className="mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm">暂无日程安排</p>
                <p className="mt-1 text-xs">点击"新建日程"添加日程</p>
              </div>
            )}
          </GlassCard>

          {/* Upcoming events */}
          <GlassCard title="即将到来">
            {upcomingEvents.length > 0 ? (
              <ScrollArea className="max-h-[360px]">
                <div className="space-y-0">
                  {upcomingEvents.map((event, i) => {
                    const config = CATEGORY_CONFIG[event.category]
                    const eventDate = new Date(
                      event.date + 'T00:00:00'
                    )
                    const dayLabel = formatDisplayDate(eventDate)
                    return (
                      <div key={event.id}>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="flex w-full items-start gap-3 py-3 text-left transition-colors hover:bg-muted/50 rounded-lg px-2 -mx-2"
                        >
                          <div
                            className={cn(
                              'mt-0.5 flex h-2 w-2 shrink-0 rounded-full',
                              config.dot
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">
                                {event.title}
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                                  config.bg,
                                  config.color
                                )}
                              >
                                {config.label}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {dayLabel}
                              </span>
                              {event.time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {event.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                        {i < upcomingEvents.length - 1 && <Separator />}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">暂无即将到来的日程</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Event modal */}
      <EventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialDate={selectedDateKey}
        initialEvent={editingEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </PageTransition>
  )
}
