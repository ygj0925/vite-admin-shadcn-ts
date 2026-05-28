import { useState, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, Search, RotateCcw, Copy, Eye, EyeOff, Download, MoreHorizontal, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/data-table'
import { CrudForm, type FormField } from '@/components/crud-form'
import { DeleteConfirm } from '@/components/delete-confirm'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCrud } from '@/hooks/use-crud'
import { usePermission } from '@/hooks/use-permission'
import { getAppPage, addApp, updateApp, deleteApp, getAppSecret, resetAppSecret, exportApp, type OpenApp } from '@/apis/open/app'
import { toast } from 'sonner'

export default function OpenAppPage() {
  const { has } = usePermission()
  const [name, setName] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [current, setCurrent] = useState<Partial<OpenApp> | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OpenApp | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<OpenApp | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTarget, setDetailTarget] = useState<OpenApp | null>(null)
  const [visibleSecrets, setVisibleSecrets] = useState<Record<number, string>>({})

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const query: Record<string, unknown> = { ...params }
      if (name) query.name = name
      return getAppPage(query as any)
    },
    [name]
  )

  const { data, total, loading, query, fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange } = useCrud<OpenApp, any>({ listApi })

  const fields: FormField[] = [
    { name: 'name', label: '应用名称', type: 'input', required: true, placeholder: '请输入应用名称' },
    { name: 'accessKey', label: 'Access Key', type: 'input', required: true, placeholder: '请输入Access Key' },
    { name: 'secretKey', label: 'Secret Key', type: 'password', placeholder: '请输入Secret Key', hidden: !!current?.id },
    { name: 'expireTime', label: '过期时间', type: 'input', placeholder: '请输入过期时间' },
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

  const handleAdd = () => { setCurrent(null); setFormTitle('新增应用'); setFormOpen(true) }
  const handleEdit = (row: OpenApp) => { setCurrent(row); setFormTitle('编辑应用'); setFormOpen(true) }
  const handleDetail = (row: OpenApp) => { setDetailTarget(row); setDetailOpen(true) }

  const handleSubmit = async (values: Record<string, unknown>) => {
    setFormLoading(true)
    try {
      if (current?.id) {
        await updateApp(current.id, values as Partial<OpenApp>)
        toast.success('更新成功')
      } else {
        await addApp(values as Partial<OpenApp>)
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
      await deleteApp([String(deleteTarget.id)])
      toast.success('删除成功')
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchData()
    } catch {
      // handled by interceptor
    }
  }

  const handleShowSecret = async (row: OpenApp) => {
    if (visibleSecrets[row.id]) {
      setVisibleSecrets((prev) => { const next = { ...prev }; delete next[row.id]; return next })
      return
    }
    try {
      const res = await getAppSecret(row.id)
      setVisibleSecrets((prev) => ({ ...prev, [row.id]: res.data }))
    } catch {
      // handled by interceptor
    }
  }

  const handleResetSecret = async () => {
    if (!resetTarget) return
    try {
      await resetAppSecret(resetTarget.id)
      toast.success('密钥重置成功')
      setResetOpen(false)
      setResetTarget(null)
      fetchData()
    } catch {
      // handled by interceptor
    }
  }

  const handleExport = async () => {
    try {
      const res = await exportApp()
      const url = URL.createObjectURL(res.data as any)
      const a = document.createElement('a')
      a.href = url
      a.download = `open-app-${Date.now()}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('导出成功')
    } catch {
      // handled by interceptor
    }
  }

  const maskSecret = (secret: string) => {
    if (!secret || secret.length <= 8) return '******'
    return secret.slice(0, 4) + '****' + secret.slice(-4)
  }

  const columns: ColumnDef<OpenApp, any>[] = [
    { accessorKey: 'name', header: '应用名称' },
    { accessorKey: 'accessKey', header: 'Access Key' },
    {
      accessorKey: 'secretKey',
      header: 'Secret Key',
      cell: ({ row }) => {
        const visible = visibleSecrets[row.original.id]
        return (
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs">{visible || maskSecret(row.original.secretKey)}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleShowSecret(row.original)}>
              {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => {
              navigator.clipboard.writeText(visible || row.original.secretKey)
              toast.success('已复制')
            }}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )
      },
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
    { accessorKey: 'description', header: '描述' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {has('open:app:update') && (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
              <Pencil className="h-4 w-4" />
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
              {has('open:app:resetSecret') && (
                <DropdownMenuItem onClick={() => { setResetTarget(row.original); setResetOpen(true) }}>
                  <RefreshCw className="h-4 w-4 mr-2" /> 重置密钥
                </DropdownMenuItem>
              )}
              {has('open:app:delete') && (
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

  const handleSearchClick = () => handleSearch({ name } as any)
  const handleResetClick = () => { setName(''); handleReset() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-foreground">应用管理</h1>
          <p className="text-sm text-muted-foreground mt-1">开放平台应用管理</p>
        </div>
        <div className="flex items-center gap-2">
          {has('open:app:export') && (
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" /> 导出
            </Button>
          )}
          {has('open:app:create') && (
            <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 mr-1" />新增</Button>
          )}
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">应用名称</Label>
          <Input placeholder="请输入应用名称" value={name} onChange={(e) => setName(e.target.value)} className="h-8 w-48" />
        </div>
        <Button size="sm" onClick={handleSearchClick}><Search className="h-4 w-4 mr-1" />搜索</Button>
        <Button size="sm" variant="outline" onClick={handleResetClick}><RotateCcw className="h-4 w-4 mr-1" />重置</Button>
      </div>

      <DataTable columns={columns} data={data} total={total} page={query.page || 1} size={query.size || 10} loading={loading} onPageChange={handlePageChange} onSizeChange={handleSizeChange} />

      <CrudForm open={formOpen} onOpenChange={setFormOpen} title={formTitle} fields={fields} values={current || {}} loading={formLoading} onSubmit={handleSubmit} />
      <DeleteConfirm open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} />
      <DeleteConfirm open={resetOpen} onOpenChange={setResetOpen} onConfirm={handleResetSecret} title="确认重置" description="确定重置该应用的密钥吗？重置后旧密钥将立即失效。" />

      {/* Detail drawer */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>应用详情</SheetTitle>
            <SheetDescription>{detailTarget?.name}</SheetDescription>
          </SheetHeader>
          {detailTarget && (
            <div className="px-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">应用名称：</span>{detailTarget.name}</div>
                <div><span className="text-muted-foreground">Access Key：</span>{detailTarget.accessKey}</div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Secret Key：</span>
                  <span className="font-mono text-xs">{visibleSecrets[detailTarget.id] || maskSecret(detailTarget.secretKey)}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1" onClick={() => handleShowSecret(detailTarget)}>
                    {visibleSecrets[detailTarget.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
                <div>
                  <span className="text-muted-foreground">状态：</span>
                  <Badge variant={detailTarget.status === 1 ? 'default' : 'secondary'}>{detailTarget.status === 1 ? '启用' : '禁用'}</Badge>
                </div>
                <div><span className="text-muted-foreground">过期时间：</span>{detailTarget.expireTime || '永不过期'}</div>
                {detailTarget.createUserString && <div><span className="text-muted-foreground">创建人：</span>{detailTarget.createUserString}</div>}
                <div><span className="text-muted-foreground">创建时间：</span>{detailTarget.createTime}</div>
                {detailTarget.updateUserString && <div><span className="text-muted-foreground">更新人：</span>{detailTarget.updateUserString}</div>}
                {detailTarget.updateTime && <div><span className="text-muted-foreground">更新时间：</span>{detailTarget.updateTime}</div>}
                {detailTarget.description && <div className="col-span-2"><span className="text-muted-foreground">描述：</span>{detailTarget.description}</div>}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
