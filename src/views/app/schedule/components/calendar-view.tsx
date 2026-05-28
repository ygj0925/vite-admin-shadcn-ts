import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type EventCategory = 'work' | 'personal' | 'important' | 'reminder'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time?: string
  endTime?: string
  category: EventCategory
  description?: string
}

// eslint-disable-next-line react-refresh/only-export-components
export const CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; color: string; dot: string; bg: string }
> = {
  work: {
    label: '工作',
    color: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    bg: 'bg-blue-500/10',
  },
  personal: {
    label: '个人',
    color: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  important: {
    label: '重要',
    color: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
    bg: 'bg-rose-500/10',
  },
  reminder: {
    label: '提醒',
    color: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    bg: 'bg-amber-500/10',
  },
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  // Convert Sunday=0 to Monday-start: Mon=0, Sun=6
  return day === 0 ? 6 : day - 1
}

function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

interface CalendarViewProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  events: CalendarEvent[]
}

export function CalendarView({ selectedDate, onDateSelect, events }: CalendarViewProps) {
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()

  const monthLabel = `${year} 年 ${month + 1} 月`

  // Map events by date key for quick lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const ev of events) {
      const list = map.get(ev.date) || []
      list.push(ev)
      map.set(ev.date, list)
    }
    return map
  }, [events])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOffset = getFirstDayOfMonth(year, month)

  const today = new Date()
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())
  const selectedKey = formatDateKey(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  )

  // Build the grid cells
  const cells: Array<{ day: number; dateKey: string; inMonth: boolean }> = []
  // Leading empty cells for offset
  for (let i = 0; i < firstDayOffset; i++) {
    const d = daysInMonth - firstDayOffset + i + 1
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const dateKey = formatDateKey(prevYear, prevMonth, d)
    cells.push({ day: d, dateKey, inMonth: false })
  }
  // Actual month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = formatDateKey(year, month, d)
    cells.push({ day: d, dateKey, inMonth: true })
  }
  // Trailing empty cells to fill the grid
  const remainder = cells.length % 7
  if (remainder !== 0) {
    const fill = 7 - remainder
    for (let i = 1; i <= fill; i++) {
      const nextMonth = month === 11 ? 0 : month + 1
      const nextYear = month === 11 ? year + 1 : year
      const dateKey = formatDateKey(nextYear, nextMonth, i)
      cells.push({ day: i, dateKey, inMonth: false })
    }
  }

  function navigateMonth(delta: number) {
    const newDate = new Date(year, month + delta, 1)
    onDateSelect(newDate)
  }

  function selectDay(day: number) {
    onDateSelect(new Date(year, month, day))
  }

  return (
    <div className="space-y-3">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{monthLabel}</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateMonth(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          const dayEvents = eventsByDate.get(cell.dateKey) || []
          const isToday = cell.dateKey === todayKey
          const isSelected = cell.dateKey === selectedKey && cell.inMonth

          return (
            <button
              key={idx}
              onClick={() => {
                if (cell.inMonth) selectDay(cell.day)
              }}
              className={cn(
                'relative flex h-10 flex-col items-center justify-center rounded-lg text-sm transition-colors',
                cell.inMonth
                  ? 'cursor-pointer hover:bg-muted'
                  : 'cursor-default text-muted-foreground/40',
                isToday && !isSelected && 'bg-primary/10 font-semibold text-primary',
                isSelected && 'bg-primary font-semibold text-primary-foreground'
              )}
            >
              <span>{cell.day}</span>
              {dayEvents.length > 0 && cell.inMonth && (
                <span className="absolute bottom-0.5 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((ev, i) => (
                    <span
                      key={i}
                      className={cn(
                        'h-1 w-1 rounded-full',
                        CATEGORY_CONFIG[ev.category].dot
                      )}
                    />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
