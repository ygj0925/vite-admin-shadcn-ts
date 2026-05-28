import { useState, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Pencil, Trash2, KeyRound, Search, RotateCcw, Eye, MoreHorizontal } from 'lucide-react'
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
import { getTenantPage, addTenant, updateTenant, deleteTenant, resetTenantAdminPwd, type Tenant } from '@/apis/tenant/index'
import { encryptByRsa } from '@/utils/encrypt'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function TenantManagementPage() {
  const { has } = usePermission()
  const [name, setName] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [current, setCurrent] = useState<Partial<Tenant> | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<Tenant | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTarget, setDetailTarget] = useState<Tenant | null>(null)

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const query: Record<string, unknown> = { ...params }
      if (name) query.name = name
      return getTenantPage(query as any)
    },
    [name]
  )

  const { data, total, loading, query, fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange } = useCrud<Tenant, any>({ listApi })

  const fields: FormField[] = [
    { name: 'name', label: '租户名称', type: 'input', required: true, placeholder: '请输入租户名称' },
    { name: 'code', label: '租户编码', type: 'input', required: true, placeholder: '请输入租户编码' },
    { name: 'domain', label: '域名', type: 'input', placeholder: '请输入域名' },
    { name: 'contactName', label: '联系人', type: 'input', required: true, placeholder: '请输入联系人' },
    { name: 'contactPhone', label: '联系电话', type: 'input', placeholder: '请输入联系电话' },
    { name: 'contactEmail', label: '联系邮箱', type: 'input', placeholder: '请输入联系邮箱' },
    { name: 'packageName', label: '套餐名称', type: 'input', placeholder: '请输入套餐名称' },
    { name: 'expireTime', label: '过期时间', type: 'input', placeholder: '请输入过期时间' },
    { name: 'accountLimit', label: '账号上限', type: 'number', placeholder: '请输入账号上限' },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '正常', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
    { name: 'description', label: '描述', type: 'textarea', rows: 3, placeholder: '请输入描述' },
  ]

  const addFields: FormField[] = [
    ...fields,
    { name: 'adminUsername', label: '管理员账号', type: 'input', required: true, placeholder: '请输入管理员账号' },
    { name: 'adminPassword', label: '管理员密码', type: 'password', required: true, placeholder: '请输入管理员密码' },
  ]

  const handleAdd = () => { setCurrent(null); setFormTitle('新增租户'); setFormOpen(true) }
  const handleEdit = (row: Tenant) => { setCurrent(row); setFormTitle('编辑租户'); setFormOpen(true) }
  const handleDetail = (row: Tenant) => { setDetailTarget(row); setDetailOpen(true) }

  const handleSubmit = async (values: Record<string, unknown>) => {
    setFormLoading(true)
    try {
      if (current?.id) {
        await updateTenant(current.id, values as Partial<Tenant>)
        toast.success('更新成功')
      } else {
        const payload = { ...values } as any
        if (payload.adminPassword) {
          payload.adminPassword = encryptByRsa(payload.adminPassword) || payload.adminPassword
        }
        await addTenant(payload)
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
      await deleteTenant(deleteTarget.id)
      toast.success('删除成功')
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchData()
    } catch {
      // handled by interceptor
    }
  }

  const handleResetPwd = async () => {
    if (!resetTarget || !resetPassword) return
    try {
      const encrypted = encryptByRsa(resetPassword) || resetPassword
      await resetTenantAdminPwd(resetTarget.id, { password: encrypted })
      toast.success('重置成功')
      setResetOpen(false)
      setResetTarget(null)
      setResetPassword('')
    } catch {
      // handled by interceptor
    }
  }

  const columns: ColumnDef<Tenant, any>[] = [
    { accessorKey: 'name', header: '租户名称' },
    { accessorKey: 'code', header: '租户编码' },
    { accessorKey: 'contactName', header: '联系人' },
    { accessorKey: 'contactPhone', header: '联系电话' },
    { accessorKey: 'packageName', header: '套餐' },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 1 ? 'default' : 'secondary'}>
          {row.original.status === 1 ? '正常' : '禁用'}
        </Badge>
      ),
    },
    { accessorKey: 'expireTime', header: '过期时间', cell: ({ row }) => row.original.expireTime || '永不过期' },
    { accessorKey: 'accountLimit', header: '账号上限' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {has('tenant:management:update') && (
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
              {has('tenant:management:resetPwd') && (
                <DropdownMenuItem onClick={() => { setResetTarget(row.original); setResetOpen(true) }}>
                  <KeyRound className="h-4 w-4 mr-2" /> 重置密码
                </DropdownMenuItem>
              )}
              {has('tenant:management:delete') && (
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
          <h1 className="text-lg font-medium text-foreground">租户管理</h1>
          <p className="text-sm text-muted-foreground mt-1">多租户管理</p>
        </div>
        {has('tenant:management:create') && (
          <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 mr-1" />新增</Button>
        )}
      </div>

      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">租户名称</Label>
          <Input placeholder="请输入租户名称" value={name} onChange={(e) => setName(e.target.value)} className="h-8 w-48" />
        </div>
        <Button size="sm" onClick={handleSearchClick}><Search className="h-4 w-4 mr-1" />搜索</Button>
        <Button size="sm" variant="outline" onClick={handleResetClick}><RotateCcw className="h-4 w-4 mr-1" />重置</Button>
      </div>

      <DataTable columns={columns} data={data} total={total} page={query.page || 1} size={query.size || 10} loading={loading} onPageChange={handlePageChange} onSizeChange={handleSizeChange} />

      <CrudForm
        open={formOpen}
        onOpenChange={setFormOpen}
        title={formTitle}
        fields={current?.id ? fields : addFields}
        values={current || {}}
        loading={formLoading}
        onSubmit={handleSubmit}
        width="max-w-2xl"
      />

      <DeleteConfirm open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} />

      {/* Detail drawer */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>租户详情</SheetTitle>
            <SheetDescription>{detailTarget?.name}</SheetDescription>
          </SheetHeader>
          {detailTarget && (
            <div className="px-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">租户名称：</span>{detailTarget.name}</div>
                <div><span className="text-muted-foreground">租户编码：</span>{detailTarget.code}</div>
                <div><span className="text-muted-foreground">域名：</span>{detailTarget.domain || <span className="text-destructive">未设置</span>}</div>
                <div><span className="text-muted-foreground">联系人：</span>{detailTarget.contactName}</div>
                <div><span className="text-muted-foreground">联系电话：</span>{detailTarget.contactPhone || '-'}</div>
                <div><span className="text-muted-foreground">联系邮箱：</span>{detailTarget.contactEmail || '-'}</div>
                <div><span className="text-muted-foreground">套餐：</span>{detailTarget.packageName || '-'}</div>
                <div><span className="text-muted-foreground">账号上限：</span>{detailTarget.accountLimit}</div>
                <div><span className="text-muted-foreground">过期时间：</span>{detailTarget.expireTime || '永不过期'}</div>
                <div>
                  <span className="text-muted-foreground">状态：</span>
                  <Badge variant={detailTarget.status === 1 ? 'default' : 'secondary'}>{detailTarget.status === 1 ? '正常' : '禁用'}</Badge>
                </div>
                {detailTarget.adminUsername && <div><span className="text-muted-foreground">管理员账号：</span>{detailTarget.adminUsername}</div>}
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

      {/* Reset password dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>重置管理员密码</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="resetPassword">新密码</Label>
            <Input id="resetPassword" type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="请输入新密码" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>取消</Button>
            <Button onClick={handleResetPwd}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
