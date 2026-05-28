import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GradientButton } from '@/components/app/gradient-button'
import type { EventCategory } from './calendar-view'
import { CATEGORY_CONFIG } from './calendar-view'

export interface EventFormData {
  title: string
  date: string
  time: string
  endTime: string
  category: EventCategory
  description: string
}

interface EventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDate?: string
  initialEvent?: {
    id: string
    title: string
    date: string
    time?: string
    endTime?: string
    category: EventCategory
    description?: string
  }
  onSave: (data: EventFormData) => void
  onDelete?: (id: string) => void
}

function getDefaultValues(dateStr?: string): EventFormData {
  const today = dateStr || new Date().toISOString().slice(0, 10)
  return {
    title: '',
    date: today,
    time: '09:00',
    endTime: '10:00',
    category: 'work' as EventCategory,
    description: '',
  }
}

export function EventModal({
  open,
  onOpenChange,
  initialDate,
  initialEvent,
  onSave,
  onDelete,
}: EventModalProps) {
  const [form, setForm] = useState<EventFormData>(() =>
    getDefaultValues(initialDate)
  )

  useEffect(() => {
    if (open) {
      if (initialEvent) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
          title: initialEvent.title,
          date: initialEvent.date,
          time: initialEvent.time || '09:00',
          endTime: initialEvent.endTime || '10:00',
          category: initialEvent.category,
          description: initialEvent.description || '',
        })
      } else {
        setForm(getDefaultValues(initialDate))
      }
    }
  }, [open, initialDate, initialEvent])

  function handleSave() {
    if (!form.title.trim()) return
    onSave(form)
    onOpenChange(false)
  }

  const isEditing = !!initialEvent

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑日程' : '新建日程'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="event-title">标题</Label>
            <Input
              id="event-title"
              placeholder="请输入日程标题"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="event-date">日期</Label>
            <Input
              id="event-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="event-time">开始时间</Label>
              <Input
                id="event-time"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-end-time">结束时间</Label>
              <Input
                id="event-end-time"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>分类</Label>
            <Select
              value={form.category}
              onValueChange={(val) =>
                setForm({ ...form, category: val as EventCategory })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(CATEGORY_CONFIG) as [EventCategory, typeof CATEGORY_CONFIG.work][]).map(
                  ([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="event-desc">备注</Label>
            <Textarea
              id="event-desc"
              placeholder="可选备注信息"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {isEditing && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(initialEvent.id)
                onOpenChange(false)
              }}
            >
              删除
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <GradientButton size="sm" onClick={handleSave}>
            {isEditing ? '保存' : '创建'}
          </GradientButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
