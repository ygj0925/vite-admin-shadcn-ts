import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Square, RefreshCw, Eye, Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DataTable } from '@/components/data-table'
import { DeleteConfirm } from '@/components/delete-confirm'
import { useCrud } from '@/hooks/use-crud'
import { usePermission } from '@/hooks/use-permission'
import { getJobLogPage, stopJobLog, retryJobLog, type JobLog } from '@/apis/schedule/log'
import { getJobGroup } from '@/apis/schedule/job'
import { toast } from 'sonner'

const STATUS_OPTIONS = [
  { label: '成功', value: 1 },
  { label: '失败', value: 2 },
  { label: '运行中', value: 0 },
]

export default function JobLogPage() {
  const { has } = usePermission()
  const [searchParams] = useSearchParams()
  const [jobName, setJobName] = useState(searchParams.get('jobName') || '')
  const [groupName, setGroupName] = useState(searchParams.get('groupName') || '')
  const [taskBatchStatus, setTaskBatchStatus] = useState<string>('')
  const [groupList, setGroupList] = useState<string[]>([])

  const [stopOpen, setStopOpen] = useState(false)
  const [stopTarget, setStopTarget] = useState<JobLog | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [current, setCurrent] = useState<JobLog | null>(null)

  useEffect(() => {
    getJobGroup().then((res) => setGroupList(res.data || [])).catch(() => {})
  }, [])

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const query: Record<string, unknown> = { ...params }
      if (jobName) query.jobName = jobName
      if (groupName) query.groupName = groupName
      if (taskBatchStatus) query.taskBatchStatus = Number(taskBatchStatus)
      const jobId = searchParams.get('jobId')
      if (jobId) query.jobId = Number(jobId)
      return getJobLogPage(query as any)
    },
    [jobName, groupName, taskBatchStatus, searchParams]
  )

  const { data, total, loading, query, fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange } = useCrud<JobLog, any>({ listApi })

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

  const dictLabel = (options: { label: string; value: number }[], val: number) =>
    options.find((o) => o.value === val)?.label || String(val)

  const columns: ColumnDef<JobLog, any>[] = [
    { accessorKey: 'jobName', header: '任务名称' },
    { accessorKey: 'groupName', header: '任务分组' },
    {
      accessorKey: 'taskBatchStatus',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.taskBatchStatus === 1 ? 'default' : row.original.taskBatchStatus === 2 ? 'destructive' : 'secondary'}>
          {dictLabel(STATUS_OPTIONS, row.original.taskBatchStatus)}
        </Badge>
      ),
    },
    { accessorKey: 'executorInfo', header: '执行器信息' },
    { accessorKey: 'executionAt', header: '执行时间' },
    { accessorKey: 'createDt', header: '创建时间' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setCurrent(row.original); setDetailOpen(true) }}>
            <Eye className="h-4 w-4" />
          </Button>
          {has('schedule:log:stop') && row.original.taskBatchStatus === 0 && (
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setStopTarget(row.original); setStopOpen(true) }}>
              <Square className="h-4 w-4" />
            </Button>
          )}
          {has('schedule:log:retry') && row.original.taskBatchStatus === 2 && (
            <Button variant="ghost" size="sm" onClick={() => handleRetry(row.original)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const handleSearchClick = () => handleSearch({ jobName, groupName, taskBatchStatus } as any)
  const handleResetClick = () => { setJobName(''); setGroupName(''); setTaskBatchStatus(''); handleReset() }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">任务日志</h1>
        <p className="text-sm text-muted-foreground mt-1">定时任务执行日志</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">任务名称</Label>
          <Input placeholder="请输入任务名称" value={jobName} onChange={(e) => setJobName(e.target.value)} className="h-8 w-40" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">任务分组</Label>
          <Input placeholder="请输入任务分组" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="h-8 w-40" />
        </div>
        <Button size="sm" onClick={handleSearchClick}><Search className="h-4 w-4 mr-1" />搜索</Button>
        <Button size="sm" variant="outline" onClick={handleResetClick}><RotateCcw className="h-4 w-4 mr-1" />重置</Button>
      </div>

      <DataTable columns={columns} data={data} total={total} page={query.page || 1} size={query.size || 10} loading={loading} onPageChange={handlePageChange} onSizeChange={handleSizeChange} />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>任务日志详情</DialogTitle>
          </DialogHeader>
          {current && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">任务名称：</span>{current.jobName}</div>
              <div><span className="text-muted-foreground">任务分组：</span>{current.groupName}</div>
              <div><span className="text-muted-foreground">执行器信息：</span>{current.executorInfo}</div>
              <div>
                <span className="text-muted-foreground">状态：</span>
                <Badge variant={current.taskBatchStatus === 1 ? 'default' : current.taskBatchStatus === 2 ? 'destructive' : 'secondary'}>
                  {dictLabel(STATUS_OPTIONS, current.taskBatchStatus)}
                </Badge>
              </div>
              <div><span className="text-muted-foreground">执行时间：</span>{current.executionAt}</div>
              <div><span className="text-muted-foreground">创建时间：</span>{current.createDt}</div>
              {current.operationReason && <div className="col-span-2"><span className="text-muted-foreground">操作原因：</span>{current.operationReason}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirm open={stopOpen} onOpenChange={setStopOpen} onConfirm={handleStop} title="确认停止" description="确定停止该任务吗？" />
    </div>
  )
}
