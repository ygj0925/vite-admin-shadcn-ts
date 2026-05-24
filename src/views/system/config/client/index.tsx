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
import { getClientPage, addClient, updateClient, deleteClient, type OAuthClient } from '@/apis/system/client'
import { toast } from 'sonner'

export default function ClientConfigPage() {
  const [name, setName] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [current, setCurrent] = useState<Partial<OAuthClient> | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OAuthClient | null>(null)

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const query: Record<string, unknown> = { ...params }
      if (name) query.name = name
      return getClientPage(query as any)
    },
    [name]
  )

  const { data, total, loading, query, fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange } = useCrud<OAuthClient, any>({
    listApi,
  })

  const fields: FormField[] = [
    { name: 'name', label: '名称', type: 'input', required: true, placeholder: '请输入应用名称' },
    { name: 'clientId', label: 'Client ID', type: 'input', required: true, placeholder: '请输入Client ID' },
    { name: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: '请输入Client Secret', hidden: !!current?.id },
    { name: 'logo', label: 'Logo', type: 'input', placeholder: '请输入Logo地址' },
    { name: 'redirectUri', label: '重定向地址', type: 'input', placeholder: '请输入重定向地址' },
    { name: 'grantTypes', label: '授权类型', type: 'input', placeholder: '请输入授权类型，如 authorization_code' },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
    { name: 'description', label: '描述', type: 'textarea', rows: 3, placeholder: '请输入描述' },
  ]

  const handleAdd = () => {
    setCurrent(null)
    setFormTitle('新增客户端')
    setFormOpen(true)
  }

  const handleEdit = (row: OAuthClient) => {
    setCurrent(row)
    setFormTitle('编辑客户端')
    setFormOpen(true)
  }

  const handleSubmit = async (values: Record<string, unknown>) => {
    setFormLoading(true)
    try {
      if (current?.id) {
        await updateClient(current.id, values as Partial<OAuthClient>)
        toast.success('更新成功')
      } else {
        await addClient(values as Partial<OAuthClient>)
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
      await deleteClient([String(deleteTarget.id)])
      toast.success('删除成功')
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchData()
    } catch {
      // handled by interceptor
    }
  }

  const columns: ColumnDef<OAuthClient, any>[] = [
    { accessorKey: 'name', header: '名称' },
    { accessorKey: 'clientId', header: 'Client ID' },
    { accessorKey: 'logo', header: 'Logo' },
    { accessorKey: 'grantTypes', header: '授权类型' },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 1 ? 'default' : 'secondary'}>
          {row.original.status === 1 ? '启用' : '禁用'}
        </Badge>
      ),
    },
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

  const handleSearchClick = () => handleSearch({ name } as any)
  const handleResetClick = () => { setName(''); handleReset() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-foreground">OAuth客户端</h1>
          <p className="text-sm text-muted-foreground mt-1">OAuth客户端配置</p>
        </div>
        <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 mr-1" />新增</Button>
      </div>

      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">名称</Label>
          <Input placeholder="请输入名称" value={name} onChange={(e) => setName(e.target.value)} className="h-8 w-48" />
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
