import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table'
import { CrudForm } from '@/components/crud-form'
import { DeleteConfirm } from '@/components/delete-confirm'
import { usePermission } from '@/hooks/use-permission'
import { toast } from 'sonner'
import {
  listTaskCategories,
  createTaskCategory,
  updateTaskCategory,
  deleteTaskCategory,
  type TaskCategory,
} from '@/apis/dashboard/task'
import type { ColumnDef } from '@tanstack/react-table'

export default function CategoryPage() {
  const [data, setData] = useState<TaskCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TaskCategory | null>(null)
  const { has } = usePermission()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listTaskCategories()
      const list = (res.data ?? []).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      setData(list)
    } catch {
      // handled
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = keyword
    ? data.filter((d) => d.name.toLowerCase().includes(keyword.toLowerCase()))
    : data

  const handleAdd = () => { setEditing(null); setFormOpen(true) }
  const handleEdit = (row: TaskCategory) => { setEditing(row); setFormOpen(true) }
  const handleDelete = async (row: TaskCategory) => {
    await deleteTaskCategory(row.id)
    toast.success('删除成功')
    fetchData()
  }

  const handleSubmit = async (values: Record<string, any>) => {
    if (editing) { await updateTaskCategory(editing.id, values); toast.success('修改成功') }
    else { await createTaskCategory(values); toast.success('新增成功') }
    setFormOpen(false); fetchData()
  }

  const columns: ColumnDef<TaskCategory>[] = [
    { accessorKey: 'name', header: '分类名称', size: 150 },
    { accessorKey: 'code', header: '分类标识', size: 120 },
    {
      accessorKey: 'status', header: '状态', size: 80,
      cell: ({ row }) => <Badge variant={row.original.status === 1 ? 'default' : 'secondary'}>{row.original.status === 1 ? '启用' : '禁用'}</Badge>,
    },
    { accessorKey: 'sort', header: '排序', size: 60 },
    { accessorKey: 'taskCount', header: '任务数', size: 80 },
    { accessorKey: 'description', header: '描述', size: 200 },
    { accessorKey: 'createTime', header: '创建时间', size: 180 },
    {
      id: 'actions', header: '操作', size: 120, enableResizing: false,
      cell: ({ row }) => (
        <div className="flex gap-1">
          {has('task:category:update') && (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
          {has('task:category:delete') && (
            <DeleteConfirm onConfirm={() => handleDelete(row.original)}>
              <Button variant="ghost" size="sm"><Trash2 className="h-3.5 w-3.5" /></Button>
            </DeleteConfirm>
          )}
        </div>
      ),
    },
  ]

  const formFields = [
    { name: 'name', label: '分类名称', required: true },
    { name: 'code', label: '分类标识', required: true },
    { name: 'sort', label: '排序', type: 'number' as const },
    { name: 'status', label: '状态', type: 'select' as const, options: [{ label: '启用', value: 1 }, { label: '禁用', value: 2 }] },
    { name: 'description', label: '描述', type: 'textarea' as const },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-foreground">分类管理</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="搜索分类..." value={keyword} onChange={(e) => setKeyword(e.target.value)} className="h-8 w-48" />
          <Button variant="outline" size="sm" onClick={() => { setKeyword(''); fetchData() }}>重置</Button>
          {has('task:category:create') && (
            <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 mr-1" /> 新增</Button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} />

      <CrudForm open={formOpen} onOpenChange={setFormOpen} title={editing ? '编辑分类' : '新增分类'}
        fields={formFields} initialValues={editing ?? {}} onSubmit={handleSubmit} />
    </div>
  )
}
