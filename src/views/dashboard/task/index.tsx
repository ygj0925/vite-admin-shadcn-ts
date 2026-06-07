import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Edit, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table'
import { CrudForm } from '@/components/crud-form'
import { DeleteConfirm } from '@/components/delete-confirm'
import { usePermission } from '@/hooks/use-permission'
import { toast } from 'sonner'
import {
  listTaskItems, createTaskItem, updateTaskItem, deleteTaskItem,
  listTaskCategories, type TaskItem, type TaskCategory,
} from '@/apis/dashboard/task'
import type { ColumnDef } from '@tanstack/react-table'

const STATUS_OPTIONS = [
  { label: '待处理', value: 'pending', color: 'bg-gray-100 text-gray-700' },
  { label: '进行中', value: 'in_progress', color: 'bg-blue-100 text-blue-700' },
  { label: '已完成', value: 'completed', color: 'bg-green-100 text-green-700' },
  { label: '有风险', value: 'at_risk', color: 'bg-yellow-100 text-yellow-700' },
  { label: '已阻塞', value: 'blocked', color: 'bg-red-100 text-red-700' },
]

const PRIORITY_OPTIONS = [
  { label: 'P0', value: 'P0', color: 'bg-red-100 text-red-700' },
  { label: 'P1', value: 'P1', color: 'bg-orange-100 text-orange-700' },
  { label: 'P2', value: 'P2', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'P3', value: 'P3', color: 'bg-gray-100 text-gray-700' },
]

export default function TaskPage() {
  const [data, setData] = useState<TaskItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<string>('')
  const [priority, setPriority] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [categories, setCategories] = useState<TaskCategory[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TaskItem | null>(null)
  const { has } = usePermission()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { page, size, sort: ['createTime,desc'] }
      if (keyword) params.keyword = keyword
      if (status) params.status = [status]
      if (priority) params.priority = [priority]
      if (categoryId) params.categoryId = Number(categoryId)
      const res = await listTaskItems(params as any)
      setData(res.data?.list ?? [])
      setTotal(res.data?.total ?? 0)
    } catch {
      // handled
    } finally {
      setLoading(false)
    }
  }, [page, size, keyword, status, priority, categoryId])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await listTaskCategories()
      setCategories(res.data ?? [])
    } catch { /* handled */ }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchCategories() }, [fetchCategories])

  const handleReset = () => { setKeyword(''); setStatus(''); setPriority(''); setCategoryId(''); setPage(1) }
  const handleAdd = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (row: TaskItem) => { setEditing(row); setFormOpen(true) }
  const handleDelete = async (row: TaskItem) => {
    await deleteTaskItem(row.id)
    toast.success('删除成功')
    fetchData()
  }

  const handleSubmit = async (values: Record<string, any>) => {
    if (editing) { await updateTaskItem(editing.id, values); toast.success('修改成功') }
    else { await createTaskItem(values); toast.success('新增成功') }
    setFormOpen(false); fetchData()
  }

  const columns: ColumnDef<TaskItem>[] = useMemo(() => [
    { accessorKey: 'code', header: '编号', size: 100 },
    {
      accessorKey: 'title', header: '标题', size: 250,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span className="truncate">{row.original.title}</span>
          {row.original.isOverdue && <Badge variant="destructive" className="text-[10px] px-1">逾期</Badge>}
        </div>
      ),
    },
    {
      accessorKey: 'status', header: '状态', size: 90,
      cell: ({ row }) => {
        const opt = STATUS_OPTIONS.find((s) => s.value === row.original.status)
        return opt ? <Badge className={opt.color}>{opt.label}</Badge> : row.original.status
      },
    },
    {
      accessorKey: 'priority', header: '优先级', size: 70,
      cell: ({ row }) => {
        const opt = PRIORITY_OPTIONS.find((p) => p.value === row.original.priority)
        return opt ? <Badge className={opt.color}>{opt.label}</Badge> : row.original.priority
      },
    },
    {
      accessorKey: 'categories', header: '分类', size: 120,
      cell: ({ row }) => row.original.categories?.map((c) => c.name).join(', ') || '-',
    },
    {
      accessorKey: 'owners', header: '负责人', size: 120,
      cell: ({ row }) => row.original.owners?.map((o) => o.nickname).join(', ') || '-',
    },
    { accessorKey: 'startDate', header: '开始日期', size: 110 },
    { accessorKey: 'dueDate', header: '截止日期', size: 110 },
    { accessorKey: 'latestProgress', header: '最新进展', size: 150 },
    {
      id: 'actions', header: '操作', size: 100,
      cell: ({ row }) => (
        <div className="flex gap-1">
          {has('task:item:update') && (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}><Edit className="h-3.5 w-3.5" /></Button>
          )}
          {has('task:item:delete') && (
            <DeleteConfirm onConfirm={() => handleDelete(row.original)}>
              <Button variant="ghost" size="sm"><Trash2 className="h-3.5 w-3.5" /></Button>
            </DeleteConfirm>
          )}
        </div>
      ),
    },
  ], [has])

  const formFields = [
    { name: 'title', label: '标题', required: true },
    { name: 'description', label: '描述', type: 'textarea' as const },
    { name: 'status', label: '状态', type: 'select' as const, options: STATUS_OPTIONS.map((s) => ({ label: s.label, value: s.value })) },
    { name: 'priority', label: '优先级', type: 'select' as const, options: PRIORITY_OPTIONS.map((p) => ({ label: p.label, value: p.value })) },
    { name: 'categoryId', label: '分类', type: 'select' as const, options: categories.map((c) => ({ label: c.name, value: c.id })) },
    { name: 'startDate', label: '开始日期', type: 'date' as const },
    { name: 'dueDate', label: '截止日期', type: 'date' as const },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-foreground">任务管理</h1>
        <div className="flex items-center gap-2">
          {has('task:item:create') && (
            <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 mr-1" /> 新增</Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="搜索任务..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1) }} className="h-8 w-48" />
        <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="h-8 w-28"><SelectValue placeholder="状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => { setPriority(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="h-8 w-28"><SelectValue placeholder="优先级" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部优先级</SelectItem>
            {PRIORITY_OPTIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryId} onValueChange={(v) => { setCategoryId(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="h-8 w-36"><SelectValue placeholder="分类" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="h-3.5 w-3.5 mr-1" /> 重置</Button>
      </div>

      <DataTable columns={columns} data={data} loading={loading}
        total={total} page={page} size={size}
        onPageChange={setPage} onSizeChange={setSize} />

      <CrudForm open={formOpen} onOpenChange={setFormOpen} title={editing ? '编辑任务' : '新增任务'}
        fields={formFields} initialValues={editing ?? {}} onSubmit={handleSubmit} />
    </div>
  )
}
