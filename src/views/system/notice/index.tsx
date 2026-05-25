import { useState, useMemo, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, Search, RotateCcw, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DataTable } from '@/components/data-table'
import { CrudForm, type FormField } from '@/components/crud-form'
import { DeleteConfirm } from '@/components/delete-confirm'
import { useCrud } from '@/hooks/use-crud'
import { usePermission } from '@/hooks/use-permission'
import { getNoticePage, addNotice, deleteNotice, updateNotice, type Notice } from '@/apis/system/notice'
import { toast } from 'sonner'

const typeOptions = [
  { label: '通知', value: 1 },
  { label: '公告', value: 2 },
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

export default function NoticePage() {
  const { has } = usePermission()

  const [searchTitle, setSearchTitle] = useState('')
  const [searchType, setSearchType] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [current, setCurrent] = useState<Partial<Notice> | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<string[]>([])

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<Notice | null>(null)

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const q: Record<string, unknown> = { ...params }
      if (searchTitle) q.title = searchTitle
      if (searchType) q.type = Number(searchType)
      return getNoticePage(q as any)
    },
    [searchTitle, searchType],
  )

  const {
    data, total, loading, query,
    selectedIds, setSelectedIds,
    fetchData, handleSearch, handleReset,
    handlePageChange, handleSizeChange,
    handleDelete,
  } = useCrud<Notice, any>({ listApi, deleteApi: deleteNotice })

  const fields: FormField[] = useMemo(
    () => [
      { name: 'title', label: '标题', type: 'input', required: true, placeholder: '请输入标题', span: 2 },
      {
        name: 'type',
        label: '类型',
        type: 'select',
        required: true,
        options: typeOptions,
      },
      {
        name: 'status',
        label: '状态',
        type: 'select',
        options: statusOptions,
      },
      { name: 'startTime', label: '开始时间', type: 'input', placeholder: 'yyyy-MM-dd HH:mm:ss' },
      { name: 'endTime', label: '结束时间', type: 'input', placeholder: 'yyyy-MM-dd HH:mm:ss' },
      { name: 'content', label: '内容', type: 'textarea', required: true, rows: 6, placeholder: '请输入内容', span: 2 },
    ],
    [],
  )

  const handleAdd = () => {
    setCurrent(null)
    setFormTitle('新增通知公告')
    setFormOpen(true)
  }

  const handleEdit = (row: Notice) => {
    setCurrent(row)
    setFormTitle('编辑通知公告')
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

  const openSingleDelete = (id: string) => { setDeleteIds([id]); setDeleteOpen(true) }

  const openBatchDelete = () => {
    if (selectedIds.length === 0) { toast.warning('请先选择要删除的记录'); return }
    setDeleteIds(selectedIds)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    await handleDelete(deleteIds)
    setDeleteOpen(false)
  }

  const handleSearchClick = () => handleSearch({ title: searchTitle || undefined, type: searchType ? Number(searchType) : undefined } as any)
  const handleResetClick = () => { setSearchTitle(''); setSearchType(''); handleReset() }

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
    { accessorKey: 'startTime', header: '开始时间', cell: ({ row }) => row.original.startTime || '-' },
    { accessorKey: 'endTime', header: '结束时间', cell: ({ row }) => row.original.endTime || '-' },
    { accessorKey: 'createTime', header: '创建时间' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => { setDetailItem(row.original); setDetailOpen(true) }}>
            <Eye className="h-4 w-4" />
          </Button>
          {has('system:notice:update') && (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {has('system:notice:delete') && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => openSingleDelete(String(row.original.id))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">通知公告</h1>
        <p className="text-sm text-muted-foreground mt-1">系统通知与公告管理</p>
      </div>

      {/* Search */}
      <div className="flex items-end gap-3">
        <div className="space-y-1.5">
          <Label>标题</Label>
          <Input placeholder="请输入标题" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} className="w-48" />
        </div>
        <div className="space-y-1.5">
          <Label>类型</Label>
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="w-32"><SelectValue placeholder="全部" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">通知</SelectItem>
              <SelectItem value="2">公告</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleSearchClick}>
          <Search className="mr-1.5 h-3.5 w-3.5" />搜索
        </Button>
        <Button size="sm" variant="outline" onClick={handleResetClick}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />重置
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {has('system:notice:create') && (
          <Button size="sm" onClick={handleAdd}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />新增
          </Button>
        )}
        {has('system:notice:delete') && (
          <Button variant="destructive" size="sm" disabled={selectedIds.length === 0} onClick={openBatchDelete}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />批量删除
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={query.page || 1}
        size={query.size || 10}
        loading={loading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
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

      <DeleteConfirm open={deleteOpen} onOpenChange={setDeleteOpen} count={deleteIds.length} onConfirm={confirmDelete} />

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">类型：</span>
              <Badge variant={detailItem?.type === 1 ? 'default' : 'secondary'}>
                {detailItem?.type === 1 ? '通知' : '公告'}
              </Badge>
              <span className="text-muted-foreground">状态：</span>
              <Badge variant={detailItem?.status === 1 ? 'default' : 'secondary'}>
                {detailItem?.status === 1 ? '启用' : '禁用'}
              </Badge>
            </div>
            {(detailItem?.startTime || detailItem?.endTime) && (
              <div className="text-muted-foreground text-xs">
                有效期：{detailItem?.startTime || '—'} 至 {detailItem?.endTime || '—'}
              </div>
            )}
            <ScrollArea className="max-h-64 rounded border p-3 bg-muted/30">
              <div className="whitespace-pre-wrap text-foreground">{detailItem?.content}</div>
            </ScrollArea>
            <div className="text-xs text-muted-foreground">创建时间：{detailItem?.createTime}</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
