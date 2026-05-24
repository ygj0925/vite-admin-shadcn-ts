import { useState, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, Play, Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/data-table'
import { CrudForm, type FormField } from '@/components/crud-form'
import { DeleteConfirm } from '@/components/delete-confirm'
import { useCrud } from '@/hooks/use-crud'
import { getJobPage, addJob, updateJob, deleteJob, updateJobStatus, triggerJob, type Job } from '@/apis/schedule/job'
import { toast } from 'sonner'

export default function JobPage() {
  const [name, setName] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [current, setCurrent] = useState<Partial<Job> | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null)

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const query: Record<string, unknown> = { ...params }
      if (name) query.name = name
      return getJobPage(query as any)
    },
    [name]
  )

  const { data, total, loading, query, fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange } = useCrud<Job, any>({
    listApi,
  })

  const fields: FormField[] = [
    { name: 'name', label: '任务名称', type: 'input', required: true, placeholder: '请输入任务名称' },
    { name: 'group', label: '任务分组', type: 'input', required: true, placeholder: '请输入任务分组' },
    { name: 'cron', label: 'Cron表达式', type: 'input', required: true, placeholder: '请输入Cron表达式' },
    { name: 'className', label: '执行类', type: 'input', required: true, placeholder: '请输入执行类名' },
    { name: 'description', label: '描述', type: 'textarea', rows: 3, placeholder: '请输入描述' },
    {
      name: 'concurrent',
      label: '并发执行',
      type: 'select',
      options: [
        { label: '允许', value: 1 },
        { label: '禁止', value: 0 },
      ],
    },
    {
      name: 'misfirePolicy',
      label: '执行策略',
      type: 'select',
      options: [
        { label: '默认', value: 0 },
        { label: '立即执行', value: 1 },
        { label: '执行一次', value: 2 },
        { label: '放弃执行', value: 3 },
      ],
    },
  ]

  const handleAdd = () => {
    setCurrent(null)
    setFormTitle('新增任务')
    setFormOpen(true)
  }

  const handleEdit = (row: Job) => {
    setCurrent(row)
    setFormTitle('编辑任务')
    setFormOpen(true)
  }

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
      await updateJobStatus(row.id, row.status === 1 ? 0 : 1)
      toast.success(row.status === 1 ? '已禁用' : '已启用')
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

  const columns: ColumnDef<Job, any>[] = [
    { accessorKey: 'name', header: '任务名称' },
    { accessorKey: 'group', header: '任务分组' },
    { accessorKey: 'cron', header: 'Cron表达式' },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch checked={row.original.status === 1} onCheckedChange={() => handleToggleStatus(row.original)} />
          <Badge variant={row.original.status === 1 ? 'default' : 'secondary'}>
            {row.original.status === 1 ? '启用' : '禁用'}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'concurrent',
      header: '并发执行',
      cell: ({ row }) => (row.original.concurrent ? '允许' : '禁止'),
    },
    { accessorKey: 'description', header: '描述' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleTrigger(row.original)}>
            <Play className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setDeleteTarget(row.original); setDeleteOpen(true) }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const handleSearchClick = () => handleSearch({ name } as any)
  const handleResetClick = () => { setName(''); handleReset() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-foreground">定时任务</h1>
          <p className="text-sm text-muted-foreground mt-1">定时任务管理</p>
        </div>
        <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 mr-1" />新增</Button>
      </div>

      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">任务名称</Label>
          <Input placeholder="请输入任务名称" value={name} onChange={(e) => setName(e.target.value)} className="h-8 w-48" />
        </div>
        <Button size="sm" onClick={handleSearchClick}><Search className="h-4 w-4 mr-1" />搜索</Button>
        <Button size="sm" variant="outline" onClick={handleResetClick}><RotateCcw className="h-4 w-4 mr-1" />重置</Button>
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

      <CrudForm
        open={formOpen}
        onOpenChange={setFormOpen}
        title={formTitle}
        fields={fields}
        values={current || {}}
        loading={formLoading}
        onSubmit={handleSubmit}
        width="max-w-xl"
      />

      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
    </div>
  )
}
