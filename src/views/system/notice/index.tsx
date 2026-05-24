import { useState, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/data-table'
import { CrudForm, type FormField } from '@/components/crud-form'
import { DeleteConfirm } from '@/components/delete-confirm'
import { useCrud } from '@/hooks/use-crud'
import { getNoticePage, addNotice, updateNotice, deleteNotice, type Notice } from '@/apis/system/notice'
import { toast } from 'sonner'

export default function NoticePage() {
  const [title, setTitle] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [current, setCurrent] = useState<Partial<Notice> | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null)

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const query: Record<string, unknown> = { ...params }
      if (title) query.title = title
      return getNoticePage(query as any)
    },
    [title]
  )

  const { data, total, loading, query, fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange } = useCrud<Notice, any>({
    listApi,
  })

  const fields: FormField[] = [
    { name: 'title', label: '标题', type: 'input', required: true, placeholder: '请输入标题' },
    {
      name: 'type',
      label: '类型',
      type: 'select',
      required: true,
      options: [
        { label: '通知', value: 1 },
        { label: '公告', value: 2 },
      ],
    },
    { name: 'content', label: '内容', type: 'textarea', required: true, rows: 6, placeholder: '请输入内容' },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
    { name: 'startTime', label: '开始时间', type: 'input', placeholder: '请输入开始时间' },
    { name: 'endTime', label: '结束时间', type: 'input', placeholder: '请输入结束时间' },
  ]

  const handleAdd = () => {
    setCurrent(null)
    setFormTitle('新增通知')
    setFormOpen(true)
  }

  const handleEdit = (row: Notice) => {
    setCurrent(row)
    setFormTitle('编辑通知')
    setFormOpen(true)
  }

  const handleSubmit = async (values: Record<string, unknown>) => {
    setFormLoading(true)
    try {
      if (current?.id) {
        await updateNotice(current.id, values as Partial<Notice>)
        toast.success('更新成功')
      } else {
        await addNotice(values as Partial<Notice>)
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
      await deleteNotice([String(deleteTarget.id)])
      toast.success('删除成功')
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchData()
    } catch {
      // handled by interceptor
    }
  }

  const columns: ColumnDef<Notice, any>[] = [
    { accessorKey: 'title', header: '标题' },
    {
      accessorKey: 'type',
      header: '类型',
      cell: ({ row }) => (
        <Badge variant={row.original.type === 1 ? 'default' : 'secondary'}>
          {row.original.type === 1 ? '通知' : '公告'}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 1 ? 'default' : 'secondary'}>
          {row.original.status === 1 ? '启用' : '禁用'}
        </Badge>
      ),
    },
    { accessorKey: 'startTime', header: '开始时间' },
    { accessorKey: 'endTime', header: '结束时间' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setDeleteTarget(row.original); setDeleteOpen(true) }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const handleSearchClick = () => handleSearch({ title } as any)
  const handleResetClick = () => { setTitle(''); handleReset() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-foreground">通知公告</h1>
          <p className="text-sm text-muted-foreground mt-1">系统通知管理</p>
        </div>
        <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 mr-1" />新增</Button>
      </div>

      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">标题</Label>
          <Input placeholder="请输入标题" value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 w-48" />
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
