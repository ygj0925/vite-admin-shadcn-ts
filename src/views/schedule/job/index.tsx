import { useState, useCallback, useEffect } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, Play, Search, RotateCcw, Eye, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/data-table'
import { CrudForm, type FormField } from '@/components/crud-form'
import { DeleteConfirm } from '@/components/delete-confirm'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCrud } from '@/hooks/use-crud'
import { usePermission } from '@/hooks/use-permission'
import { useDict } from '@/hooks/use-dict'
import { getJobPage, getJobGroup, addJob, updateJob, deleteJob, updateJobStatus, triggerJob, type Job } from '@/apis/schedule/job'
import { toast } from 'sonner'

const TRIGGER_TYPE_OPTIONS = [
  { label: '简单触发', value: 1 },
  { label: 'Cron触发', value: 2 },
]

const TASK_TYPE_OPTIONS = [
  { label: 'Java', value: 1 },
  { label: 'Bean', value: 2 },
  { label: 'HTTP', value: 3 },
  { label: 'Lambda', value: 4 },
]

const ROUTE_KEY_OPTIONS = [
  { label: 'Random', value: 1 },
  { label: 'RoundRobin', value: 2 },
  { label: 'LRU', value: 3 },
  { label: 'ConsistentHash', value: 4 },
  { label: 'Failover', value: 5 },
]

const BLOCK_STRATEGY_OPTIONS = [
  { label: '丢弃', value: 1 },
  { label: '覆盖', value: 2 },
  { label: '并行', value: 3 },
]

export default function JobPage() {
  const { has } = usePermission()
  const [jobName, setJobName] = useState('')
  const [groupName, setGroupName] = useState('')
  const [jobStatus, setJobStatus] = useState<string>('')
  const [groupList, setGroupList] = useState<string[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [current, setCurrent] = useState<Partial<Job> | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTarget, setDetailTarget] = useState<Job | null>(null)

  useEffect(() => {
    getJobGroup().then((res) => setGroupList(res.data || [])).catch(() => {})
  }, [])

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const query: Record<string, unknown> = { ...params }
      if (jobName) query.jobName = jobName
      if (groupName) query.groupName = groupName
      if (jobStatus) query.jobStatus = Number(jobStatus)
      return getJobPage(query as any)
    },
    [jobName, groupName, jobStatus]
  )

  const { data, total, loading, query, fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange } = useCrud<Job, any>({ listApi })

  const fields: FormField[] = [
    { name: 'groupName', label: '任务分组', type: 'select', required: true, options: groupList.map((g) => ({ label: g, value: g })), placeholder: '请选择任务分组' },
    { name: 'jobName', label: '任务名称', type: 'input', required: true, placeholder: '请输入任务名称' },
    { name: 'triggerType', label: '触发类型', type: 'select', required: true, options: TRIGGER_TYPE_OPTIONS },
    { name: 'triggerInterval', label: '触发间隔', type: 'input', required: true, placeholder: '请输入触发间隔' },
    { name: 'taskType', label: '任务类型', type: 'select', required: true, options: TASK_TYPE_OPTIONS },
    { name: 'executorInfo', label: '执行器信息', type: 'input', required: true, placeholder: '请输入执行器信息' },
    { name: 'argsStr', label: '执行参数', type: 'textarea', rows: 2, placeholder: '请输入执行参数' },
    { name: 'routeKey', label: '路由策略', type: 'select', options: ROUTE_KEY_OPTIONS },
    { name: 'blockStrategy', label: '阻塞策略', type: 'select', options: BLOCK_STRATEGY_OPTIONS },
    { name: 'executorTimeout', label: '超时时间(秒)', type: 'input', placeholder: '请输入超时时间' },
    { name: 'maxRetryTimes', label: '最大重试次数', type: 'input', placeholder: '请输入最大重试次数' },
    { name: 'retryInterval', label: '重试间隔(秒)', type: 'input', placeholder: '请输入重试间隔' },
    { name: 'parallelNum', label: '并行数量', type: 'input', placeholder: '请输入并行数量' },
    { name: 'description', label: '描述', type: 'textarea', rows: 3, placeholder: '请输入描述' },
  ]

  const handleAdd = () => { setCurrent(null); setFormTitle('新增任务'); setFormOpen(true) }
  const handleEdit = (row: Job) => { setCurrent(row); setFormTitle('编辑任务'); setFormOpen(true) }
  const handleDetail = (row: Job) => { setDetailTarget(row); setDetailOpen(true) }

  const handleSubmit = async (values: Record<string, unknown>) => {
    setFormLoading(true)
    try {
      if (current?.id) {
        await updateJob(current.id, values as Partial<Job>)
        toast.success('更新成功')
      } else {
        await addJob(values as Partial<Job>)
        toast.success('新增成功')
      }
      setFormOpen(false)
      fetchData()
    } catch {
      // handled by interceptor
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteJob(deleteTarget.id)
      toast.success('删除成功')
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchData()
    } catch {
      // handled by interceptor
    }
  }

  const handleToggleStatus = async (row: Job) => {
    try {
      await updateJobStatus(row.id, row.jobStatus === 1 ? 0 : 1)
      toast.success(row.jobStatus === 1 ? '已禁用' : '已启用')
      fetchData()
    } catch {
      // handled by interceptor
    }
  }

  const handleTrigger = async (row: Job) => {
    try {
      await triggerJob(row.id)
      toast.success('触发成功')
    } catch {
      // handled by interceptor
    }
  }

  const dictLabel = (options: { label: string; value: number }[], val: number) =>
    options.find((o) => o.value === val)?.label || String(val)

  const columns: ColumnDef<Job, any>[] = [
    { accessorKey: 'jobName', header: '任务名称' },
    { accessorKey: 'groupName', header: '任务分组' },
    { accessorKey: 'triggerInterval', header: '触发间隔' },
    {
      accessorKey: 'jobStatus',
      header: '状态',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch checked={row.original.jobStatus === 1} onCheckedChange={() => handleToggleStatus(row.original)} />
          <Badge variant={row.original.jobStatus === 1 ? 'default' : 'secondary'}>
            {row.original.jobStatus === 1 ? '启用' : '禁用'}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'taskType',
      header: '任务类型',
      cell: ({ row }) => dictLabel(TASK_TYPE_OPTIONS, row.original.taskType),
    },
    { accessorKey: 'executorInfo', header: '执行器信息' },
    { accessorKey: 'nextTriggerAt', header: '下次触发时间' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {has('schedule:job:update') && (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {has('schedule:job:trigger') && (
            <Button variant="ghost" size="sm" onClick={() => handleTrigger(row.original)}>
              <Play className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDetail(row.original)}>
                <Eye className="h-4 w-4 mr-2" /> 详情
              </DropdownMenuItem>
              {has('schedule:job:delete') && (
                <DropdownMenuItem className="text-destructive" onClick={() => { setDeleteTarget(row.original); setDeleteOpen(true) }}>
                  <Trash2 className="h-4 w-4 mr-2" /> 删除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const handleSearchClick = () => handleSearch({ jobName, groupName, jobStatus } as any)
  const handleResetClick = () => { setJobName(''); setGroupName(''); setJobStatus(''); handleReset() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-foreground">定时任务</h1>
          <p className="text-sm text-muted-foreground mt-1">定时任务管理</p>
        </div>
        {has('schedule:job:create') && (
          <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 mr-1" />新增</Button>
        )}
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

      <CrudForm open={formOpen} onOpenChange={setFormOpen} title={formTitle} fields={fields} values={current || {}} loading={formLoading} onSubmit={handleSubmit} width="max-w-2xl" />
      <DeleteConfirm open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} />

      {/* Detail drawer */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>任务详情</SheetTitle>
            <SheetDescription>{detailTarget?.jobName}</SheetDescription>
          </SheetHeader>
          {detailTarget && (
            <div className="px-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">任务名称：</span>{detailTarget.jobName}</div>
                <div><span className="text-muted-foreground">任务分组：</span>{detailTarget.groupName}</div>
                <div><span className="text-muted-foreground">触发类型：</span>{dictLabel(TRIGGER_TYPE_OPTIONS, detailTarget.triggerType)}</div>
                <div><span className="text-muted-foreground">触发间隔：</span>{detailTarget.triggerInterval}</div>
                <div><span className="text-muted-foreground">任务类型：</span>{dictLabel(TASK_TYPE_OPTIONS, detailTarget.taskType)}</div>
                <div><span className="text-muted-foreground">执行器信息：</span>{detailTarget.executorInfo}</div>
                <div><span className="text-muted-foreground">路由策略：</span>{dictLabel(ROUTE_KEY_OPTIONS, detailTarget.routeKey)}</div>
                <div><span className="text-muted-foreground">阻塞策略：</span>{dictLabel(BLOCK_STRATEGY_OPTIONS, detailTarget.blockStrategy)}</div>
                <div><span className="text-muted-foreground">超时时间：</span>{detailTarget.executorTimeout}s</div>
                <div><span className="text-muted-foreground">最大重试：</span>{detailTarget.maxRetryTimes}</div>
                <div><span className="text-muted-foreground">重试间隔：</span>{detailTarget.retryInterval}s</div>
                <div><span className="text-muted-foreground">并行数量：</span>{detailTarget.parallelNum}</div>
                <div><span className="text-muted-foreground">状态：</span><Badge variant={detailTarget.jobStatus === 1 ? 'default' : 'secondary'}>{detailTarget.jobStatus === 1 ? '启用' : '禁用'}</Badge></div>
                <div><span className="text-muted-foreground">下次触发：</span>{detailTarget.nextTriggerAt || '-'}</div>
                {detailTarget.argsStr && <div className="col-span-2"><span className="text-muted-foreground">执行参数：</span>{detailTarget.argsStr}</div>}
                {detailTarget.description && <div className="col-span-2"><span className="text-muted-foreground">描述：</span>{detailTarget.description}</div>}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
