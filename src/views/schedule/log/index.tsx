import { useState, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Square, RefreshCw, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DataTable } from '@/components/data-table'
import { DeleteConfirm } from '@/components/delete-confirm'
import { useCrud } from '@/hooks/use-crud'
import { getJobLogPage, stopJobLog, retryJobLog, type JobLog } from '@/apis/schedule/log'
import { toast } from 'sonner'

export default function JobLogPage() {
  const [stopOpen, setStopOpen] = useState(false)
  const [stopTarget, setStopTarget] = useState<JobLog | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [current, setCurrent] = useState<JobLog | null>(null)

  const listApi = useCallback((params: Record<string, unknown>) => getJobLogPage(params as any), [])

  const { data, total, loading, query, fetchData, handlePageChange, handleSizeChange } = useCrud<JobLog, any>({
    listApi,
  })

  const handleStop = async () => {
    if (!stopTarget) return
    try {
      await stopJobLog(stopTarget.id)
      toast.success('停止成功')
      setStopOpen(false)
      setStopTarget(null)
      fetchData()
    } catch {
      // handled by interceptor
    }
  }

  const handleRetry = async (row: JobLog) => {
    try {
      await retryJobLog(row.id)
      toast.success('重试成功')
      fetchData()
    } catch {
      // handled by interceptor
    }
  }

  const columns: ColumnDef<JobLog, any>[] = [
    { accessorKey: 'jobName', header: '任务名称' },
    { accessorKey: 'jobGroup', header: '任务分组' },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 1 ? 'default' : row.original.status === 2 ? 'destructive' : 'secondary'}>
          {row.original.status === 1 ? '成功' : row.original.status === 2 ? '失败' : '运行中'}
        </Badge>
      ),
    },
    { accessorKey: 'errorMsg', header: '错误信息' },
    { accessorKey: 'startTime', header: '开始时间' },
    { accessorKey: 'endTime', header: '结束时间' },
    {
      accessorKey: 'duration',
      header: '耗时',
      cell: ({ row }) => row.original.duration ? `${row.original.duration}ms` : '-',
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setCurrent(row.original); setDetailOpen(true) }}>
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.status === 0 && (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setStopTarget(row.original); setStopOpen(true) }}>
              <Square className="h-4 w-4" />
            </Button>
          )}
          {row.original.status === 2 && (
            <Button variant="ghost" size="sm" onClick={() => handleRetry(row.original)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">任务日志</h1>
        <p className="text-sm text-muted-foreground mt-1">定时任务执行日志</p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={query.page || 1}
        size={query.size || 10}
        loading={loading}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
      />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>任务日志详情</DialogTitle>
          </DialogHeader>
          {current && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">任务名称：</span>{current.jobName}</div>
              <div><span className="text-muted-foreground">任务分组：</span>{current.jobGroup}</div>
              <div><span className="text-muted-foreground">执行类：</span>{current.className}</div>
              <div><span className="text-muted-foreground">Cron：</span>{current.cron}</div>
              <div>
                <span className="text-muted-foreground">状态：</span>
                <Badge variant={current.status === 1 ? 'default' : current.status === 2 ? 'destructive' : 'secondary'}>
                  {current.status === 1 ? '成功' : current.status === 2 ? '失败' : '运行中'}
                </Badge>
              </div>
              <div><span className="text-muted-foreground">耗时：</span>{current.duration ? `${current.duration}ms` : '-'}</div>
              <div><span className="text-muted-foreground">开始时间：</span>{current.startTime}</div>
              <div><span className="text-muted-foreground">结束时间：</span>{current.endTime}</div>
              {current.errorMsg && <div className="col-span-2"><span className="text-muted-foreground">错误信息：</span>{current.errorMsg}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirm
        open={stopOpen}
        onOpenChange={setStopOpen}
        onConfirm={handleStop}
      />
    </div>
  )
}
