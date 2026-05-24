import { useCallback, useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FieldMode = 'UNSET' | 'EVERY' | 'RANGE' | 'LOOP' | 'LAST' | 'WORK' | 'SPECIFY'

interface FieldState {
  mode: FieldMode
  value: string
  start: string
  end: string
  loop: string
}

interface CronBuilderProps {
  value?: string
  onChange: (cron: string) => void
  disabled?: boolean
  hideSecond?: boolean
  hideYear?: boolean
}

const DEFAULT_FIELD: FieldState = {
  mode: 'EVERY',
  value: '*',
  start: '0',
  end: '1',
  loop: '1',
}

const FIELDS = [
  { key: 'second', label: '秒', min: 0, max: 59 },
  { key: 'minute', label: '分', min: 0, max: 59 },
  { key: 'hour', label: '时', min: 0, max: 23 },
  { key: 'day', label: '日', min: 1, max: 31 },
  { key: 'month', label: '月', min: 1, max: 12 },
  { key: 'week', label: '周', min: 1, max: 7 },
  { key: 'year', label: '年', min: 1970, max: 2099 },
] as const

type FieldKey = (typeof FIELDS)[number]['key']

const MODE_OPTIONS: { value: FieldMode; label: string }[] = [
  { value: 'EVERY', label: '每一个' },
  { value: 'RANGE', label: '范围' },
  { value: 'LOOP', label: '循环' },
  { value: 'LAST', label: '最后一天' },
  { value: 'WORK', label: '工作日' },
  { value: 'SPECIFY', label: '指定' },
]

function fieldToExpression(field: FieldState, _fieldKey: FieldKey): string {
  switch (field.mode) {
    case 'UNSET':
      return '?'
    case 'EVERY':
      return field.value || '*'
    case 'RANGE':
      return `${field.start}-${field.end}`
    case 'LOOP':
      return `${field.start}/${field.loop}`
    case 'LAST':
      return 'L'
    case 'WORK':
      return `${field.start}W`
    case 'SPECIFY':
      return field.value || '*'
    default:
      return '*'
  }
}

function parseFieldToState(expr: string, fieldKey: FieldKey): FieldState {
  if (!expr || expr === '*') {
    return { ...DEFAULT_FIELD, mode: 'EVERY', value: '*' }
  }
  if (expr === '?') {
    return { ...DEFAULT_FIELD, mode: 'UNSET', value: '?' }
  }
  if (expr === 'L') {
    return { ...DEFAULT_FIELD, mode: 'LAST', value: 'L' }
  }
  if (expr.endsWith('W')) {
    return { ...DEFAULT_FIELD, mode: 'WORK', start: expr.replace('W', ''), value: expr }
  }
  if (expr.includes('/')) {
    const [start, loop] = expr.split('/')
    return { ...DEFAULT_FIELD, mode: 'LOOP', start: start === '*' ? '0' : start, loop, value: expr }
  }
  if (expr.includes('-')) {
    const [start, end] = expr.split('-')
    return { ...DEFAULT_FIELD, mode: 'RANGE', start, end, value: expr }
  }
  return { ...DEFAULT_FIELD, mode: 'SPECIFY', value: expr }
}

interface FieldTabProps {
  fieldKey: FieldKey
  label: string
  min: number
  max: number
  state: FieldState
  onChange: (state: FieldState) => void
  disabled?: boolean
}

function FieldTab({ fieldKey, label, min, max, state, onChange, disabled }: FieldTabProps) {
  const handleModeChange = useCallback(
    (mode: string) => {
      const m = mode as FieldMode
      let newState: FieldState
      switch (m) {
        case 'UNSET':
          newState = { ...state, mode: m, value: '?' }
          break
        case 'EVERY':
          newState = { ...state, mode: m, value: '*' }
          break
        case 'RANGE':
          newState = { ...state, mode: m, start: String(min), end: String(max), value: `${min}-${max}` }
          break
        case 'LOOP':
          newState = { ...state, mode: m, start: String(min), loop: '1', value: `${min}/1` }
          break
        case 'LAST':
          newState = { ...state, mode: m, value: 'L' }
          break
        case 'WORK':
          newState = { ...state, mode: m, start: '15', value: '15W' }
          break
        case 'SPECIFY':
          newState = { ...state, mode: m, value: '' }
          break
        default:
          newState = state
      }
      onChange(newState)
    },
    [state, onChange, min, max]
  )

  const updateField = useCallback(
    (updates: Partial<FieldState>) => {
      const next = { ...state, ...updates }
      next.value = fieldToExpression(next, fieldKey)
      onChange(next)
    },
    [state, onChange, fieldKey]
  )

  return (
    <div className="space-y-4">
      <RadioGroup
        value={state.mode}
        onValueChange={handleModeChange}
        disabled={disabled}
        className="grid grid-cols-3 gap-2"
      >
        {fieldKey === 'day' || fieldKey === 'week' ? (
          <div className="flex items-center gap-2">
            <RadioGroupItem value="UNSET" id={`${fieldKey}-unset`} />
            <Label htmlFor={`${fieldKey}-unset`} className="text-sm font-normal">
              不指定
            </Label>
          </div>
        ) : null}
        {MODE_OPTIONS.map((opt) => {
          // LAST and WORK only make sense for day
          if ((opt.value === 'LAST' || opt.value === 'WORK') && fieldKey !== 'day') {
            return null
          }
          return (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem value={opt.value} id={`${fieldKey}-${opt.value}`} />
              <Label htmlFor={`${fieldKey}-${opt.value}`} className="text-sm font-normal">
                {opt.label}
              </Label>
            </div>
          )
        })}
      </RadioGroup>

      <div className="space-y-3 rounded-md border p-3">
        {state.mode === 'EVERY' && (
          <div className="flex items-center gap-2 text-sm">
            <span>每</span>
            <Input
              className="h-8 w-16"
              value={state.value === '*' ? '' : state.value}
              placeholder="*"
              disabled={disabled}
              onChange={(e) => updateField({ value: e.target.value || '*' })}
            />
            <span>{label}执行一次</span>
          </div>
        )}

        {state.mode === 'RANGE' && (
          <div className="flex items-center gap-2 text-sm">
            <span>从</span>
            <Input
              className="h-8 w-16"
              type="number"
              min={min}
              max={max}
              value={state.start}
              disabled={disabled}
              onChange={(e) => updateField({ start: e.target.value })}
            />
            <span>到</span>
            <Input
              className="h-8 w-16"
              type="number"
              min={min}
              max={max}
              value={state.end}
              disabled={disabled}
              onChange={(e) => updateField({ end: e.target.value })}
            />
          </div>
        )}

        {state.mode === 'LOOP' && (
          <div className="flex items-center gap-2 text-sm">
            <span>从</span>
            <Input
              className="h-8 w-16"
              type="number"
              min={min}
              max={max}
              value={state.start}
              disabled={disabled}
              onChange={(e) => updateField({ start: e.target.value })}
            />
            <span>开始，每隔</span>
            <Input
              className="h-8 w-16"
              type="number"
              min={1}
              value={state.loop}
              disabled={disabled}
              onChange={(e) => updateField({ loop: e.target.value })}
            />
            <span>{label}执行一次</span>
          </div>
        )}

        {state.mode === 'LAST' && (
          <p className="text-sm text-muted-foreground">每月最后一天执行</p>
        )}

        {state.mode === 'WORK' && (
          <div className="flex items-center gap-2 text-sm">
            <span>每月</span>
            <Input
              className="h-8 w-16"
              type="number"
              min={1}
              max={31}
              value={state.start}
              disabled={disabled}
              onChange={(e) => updateField({ start: e.target.value })}
            />
            <span>号最近的工作日执行</span>
          </div>
        )}

        {state.mode === 'SPECIFY' && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              多个值用逗号分隔，范围 {min}-{max}
            </p>
            <Input
              className="h-8"
              placeholder={`例如: ${min},${min + 1},${min + 2}`}
              value={state.value}
              disabled={disabled}
              onChange={(e) => updateField({ value: e.target.value })}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">当前值:</Label>
          <code className="rounded bg-muted px-2 py-0.5 text-xs">
            {fieldToExpression(state, fieldKey)}
          </code>
        </div>
      </div>
    </div>
  )
}

function getNextExecutions(cronExpr: string, count: number): string[] {
  // Simple next execution time calculator for basic cron expressions
  // For complex expressions, a library like cron-parser would be needed
  try {
    const parts = cronExpr.split(' ')
    if (parts.length < 6) return []

    const results: string[] = []
    const now = new Date()

    // Simple approach: iterate minutes and find matches
    const checkDate = new Date(now)
    checkDate.setSeconds(0)
    checkDate.setMilliseconds(0)
    checkDate.setMinutes(checkDate.getMinutes() + 1)

    const maxIterations = 60 * 24 * 32 // up to ~32 days
    let iterations = 0

    while (results.length < count && iterations < maxIterations) {
      const sec = checkDate.getSeconds()
      const min = checkDate.getMinutes()
      const hour = checkDate.getHours()
      const day = checkDate.getDate()
      const month = checkDate.getMonth() + 1
      const dow = checkDate.getDay() === 0 ? 7 : checkDate.getDay()

      const [s, m, h, d, mo, w] = parts

      const matchField = (field: string, value: number) => {
        if (field === '*' || field === '?') return true
        if (field.includes(',')) return field.split(',').some((v) => matchField(v.trim(), value))
        if (field.includes('/')) {
          const [base, step] = field.split('/')
          const stepNum = parseInt(step)
          if (base === '*') return value % stepNum === 0
          return (value - parseInt(base)) % stepNum === 0
        }
        if (field.includes('-')) {
          const [from, to] = field.split('-').map(Number)
          return value >= from && value <= to
        }
        if (field === 'L') return day === new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0).getDate()
        return parseInt(field) === value
      }

      if (
        matchField(s, sec) &&
        matchField(m, min) &&
        matchField(h, hour) &&
        matchField(d, day) &&
        matchField(mo, month) &&
        matchField(w, dow)
      ) {
        results.push(
          checkDate.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        )
      }

      checkDate.setMinutes(checkDate.getMinutes() + 1)
      iterations++
    }

    return results
  } catch {
    return []
  }
}

export function CronBuilder({
  value = '* * * * * *',
  onChange,
  disabled = false,
  hideSecond = false,
  hideYear = true,
}: CronBuilderProps) {
  const [activeTab, setActiveTab] = useState<string>(hideSecond ? 'minute' : 'second')

  // Parse initial value into field states
  const parseValue = useCallback(
    (val: string) => {
      const parts = val.split(' ')
      const states: Record<FieldKey, FieldState> = {
        second: parseFieldToState(parts[0] || '*', 'second'),
        minute: parseFieldToState(parts[1] || '*', 'minute'),
        hour: parseFieldToState(parts[2] || '*', 'hour'),
        day: parseFieldToState(parts[3] || '*', 'day'),
        month: parseFieldToState(parts[4] || '*', 'month'),
        week: parseFieldToState(parts[5] || '?', 'week'),
        year: parseFieldToState(parts[6] || '*', 'year'),
      }
      return states
    },
    []
  )

  const [fields, setFields] = useState<Record<FieldKey, FieldState>>(() => parseValue(value))

  // Sync from external value
  useEffect(() => {
    setFields(parseValue(value))
  }, [value, parseValue])

  const handleFieldChange = useCallback(
    (key: FieldKey, state: FieldState) => {
      setFields((prev) => {
        const next = { ...prev, [key]: state }
        const cronParts = FIELDS.filter((f) => {
          if (f.key === 'second' && hideSecond) return false
          if (f.key === 'year' && hideYear) return false
          return true
        }).map((f) => fieldToExpression(next[f.key], f.key))
        onChange(cronParts.join(' '))
        return next
      })
    },
    [onChange, hideSecond, hideYear]
  )

  const cronExpression = useMemo(() => {
    return FIELDS.filter((f) => {
      if (f.key === 'second' && hideSecond) return false
      if (f.key === 'year' && hideYear) return false
      return true
    })
      .map((f) => fieldToExpression(fields[f.key], f.key))
      .join(' ')
  }, [fields, hideSecond, hideYear])

  const nextExecutions = useMemo(() => getNextExecutions(cronExpression, 5), [cronExpression])

  const visibleFields = FIELDS.filter((f) => {
    if (f.key === 'second' && hideSecond) return false
    if (f.key === 'year' && hideYear) return false
    return true
  })

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="w-full">
          {visibleFields.map((f) => (
            <TabsTrigger key={f.key} value={f.key} className="flex-1">
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {visibleFields.map((f) => (
          <TabsContent key={f.key} value={f.key}>
            <FieldTab
              fieldKey={f.key}
              label={f.label}
              min={f.min}
              max={f.max}
              state={fields[f.key]}
              onChange={(state) => handleFieldChange(f.key, state)}
              disabled={disabled}
            />
          </TabsContent>
        ))}
      </Tabs>

      <div className="space-y-2 rounded-md border p-3">
        <Label className="text-xs text-muted-foreground">表达式预览</Label>
        <div className="flex items-center gap-2">
          <Input
            className={cn('h-8 font-mono', disabled && 'opacity-50')}
            value={cronExpression}
            readOnly
          />
        </div>
        {visibleFields.map((f) => (
          <div key={f.key} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-8 text-right">{f.label}:</span>
            <code className="rounded bg-muted px-1.5 py-0.5">
              {fieldToExpression(fields[f.key], f.key)}
            </code>
          </div>
        ))}
      </div>

      {nextExecutions.length > 0 && (
        <div className="space-y-2 rounded-md border p-3">
          <Label className="text-xs text-muted-foreground">未来 5 次执行时间</Label>
          <ul className="space-y-1">
            {nextExecutions.map((time, i) => (
              <li key={i} className="text-sm font-mono">
                {time}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
