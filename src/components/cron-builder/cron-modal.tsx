import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CronBuilder } from './index'

interface CronModalProps {
  value?: string
  onOk: (cron: string) => void
  trigger: React.ReactNode
  hideSecond?: boolean
  hideYear?: boolean
}

export function CronModal({
  value = '* * * * * *',
  onOk,
  trigger,
  hideSecond = false,
  hideYear = true,
}: CronModalProps) {
  const [open, setOpen] = useState(false)
  const [cronValue, setCronValue] = useState(value)

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        setCronValue(value)
      }
      setOpen(isOpen)
    },
    [value]
  )

  const handleOk = useCallback(() => {
    // Validate that day and week are not both "?"
    const parts = cronValue.split(' ')
    // day is index 3 (or 2 if hideSecond), week is index 4 (or 3 if hideSecond)
    const dayIdx = hideSecond ? 2 : 3
    const weekIdx = hideSecond ? 3 : 4
    const dayField = parts[dayIdx]
    const weekField = parts[weekIdx]

    if (dayField === '?' && weekField === '?') {
      alert('日期和星期不能同时为"不指定"，请指定其中一个。')
      return
    }

    onOk(cronValue)
    setOpen(false)
  }, [cronValue, onOk, hideSecond])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cron 表达式生成器</DialogTitle>
          <DialogDescription>配置 Cron 表达式的各个字段</DialogDescription>
        </DialogHeader>

        <CronBuilder
          value={cronValue}
          onChange={setCronValue}
          hideSecond={hideSecond}
          hideYear={hideYear}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleOk}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
