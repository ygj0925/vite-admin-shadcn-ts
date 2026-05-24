import { useState, useMemo, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Download, Search, RotateCcw, Pencil, KeyRound, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { DataTable } from '@/components/data-table'
import { CrudForm, type FormField } from '@/components/crud-form'
import { DeleteConfirm } from '@/components/delete-confirm'
import { useCrud } from '@/hooks/use-crud'
import { usePermission } from '@/hooks/use-permission'

import {
  getUserPage,
  addUser,
  updateUser,
  deleteUser,
  resetPassword,
  exportUser,
  type User,
  type UserPageQuery,
} from '@/apis/system/user'

const genderOptions = [
  { label: '男', value: '1' },
  { label: '女', value: '2' },
]

const statusOptions = [
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' },
]

export default function UserPage() {
  const { has } = usePermission()

  // CRUD hook
  const {
    data,
    total,
    loading,
    query,
    selectedIds,
    setSelectedIds,
    fetchData,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleDelete,
    handleExport,
  } = useCrud<User, UserPageQuery>({
    listApi: getUserPage,
    deleteApi: deleteUser,
    exportApi: exportUser,
  })

  // Search form state
  const [searchForm, setSearchForm] = useState({
    username: '',
    nickname: '',
    phone: '',
    status: '',
  })

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const [editingId, setEditingId] = useState<number | null>(null)

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteIds, setDeleteIds] = useState<string[]>([])

  // Password reset dialog state
  const [resetPwdOpen, setResetPwdOpen] = useState(false)
  const [resetPwdUserId, setResetPwdUserId] = useState<number | null>(null)
  const [resetPwdLoading, setResetPwdLoading] = useState(false)

  // Search handlers
  const onSearch = useCallback(() => {
    const params: Partial<UserPageQuery> = {}
    if (searchForm.username) params.username = searchForm.username
    if (searchForm.nickname) params.nickname = searchForm.nickname
    if (searchForm.phone) params.phone = searchForm.phone
    if (searchForm.status) params.status = Number(searchForm.status)
    handleSearch(params)
  }, [searchForm, handleSearch])

  const onReset = useCallback(() => {
    setSearchForm({ username: '', nickname: '', phone: '', status: '' })
    handleReset()
  }, [handleReset])

  // Create / Edit
  const openCreate = useCallback(() => {
    setEditingId(null)
    setFormTitle('新增用户')
    setFormValues({})
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((user: User) => {
    setEditingId(user.id)
    setFormTitle('编辑用户')
    setFormValues({
      username: user.username,
      nickname: user.nickname,
      gender: user.gender,
      phone: user.phone,
      email: user.email,
      deptId: user.deptId,
      status: user.status,
      description: user.description,
    })
    setFormOpen(true)
  }, [])

  const handleFormSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      setFormLoading(true)
      try {
        if (editingId) {
          await updateUser(editingId, values as Partial<User>)
          toast.success('更新成功')
        } else {
          await addUser(values as Partial<User>)
          toast.success('创建成功')
        }
        setFormOpen(false)
        fetchData()
      } catch {
        // Error handled by interceptor
      } finally {
        setFormLoading(false)
      }
    },
    [editingId, fetchData],
  )

  // Delete
  const openSingleDelete = useCallback((id: string) => {
    setDeleteIds([id])
    setDeleteOpen(true)
  }, [])

  const openBatchDelete = useCallback(() => {
    if (selectedIds.length === 0) {
      toast.warning('请先选择要删除的记录')
      return
    }
    setDeleteIds(selectedIds)
    setDeleteOpen(true)
  }, [selectedIds])

  const confirmDelete = useCallback(async () => {
    await handleDelete(deleteIds)
    setDeleteOpen(false)
  }, [handleDelete, deleteIds])

  // Password reset
  const openResetPassword = useCallback((userId: number) => {
    setResetPwdUserId(userId)
    setResetPwdOpen(true)
  }, [])

  const handleResetPassword = useCallback(async () => {
    if (!resetPwdUserId) return
    setResetPwdLoading(true)
    try {
      await resetPassword(resetPwdUserId, '123456')
      toast.success('密码已重置为 123456')
      setResetPwdOpen(false)
    } catch {
      // Error handled by interceptor
    } finally {
      setResetPwdLoading(false)
    }
  }, [resetPwdUserId])

  // Form fields
  const formFields: FormField[] = useMemo(
    () => [
      { name: 'username', label: '用户名', type: 'input', required: true, placeholder: '请输入用户名', span: 2, disabled: !!editingId },
      { name: 'nickname', label: '昵称', type: 'input', required: true, placeholder: '请输入昵称', span: 2 },
      { name: 'password', label: '密码', type: 'password', required: !editingId, placeholder: '请输入密码', hidden: !!editingId },
      { name: 'gender', label: '性别', type: 'select', options: genderOptions, placeholder: '请选择性别' },
      { name: 'phone', label: '手机号', type: 'input', placeholder: '请输入手机号' },
      { name: 'email', label: '邮箱', type: 'input', placeholder: '请输入邮箱' },
      { name: 'deptId', label: '部门ID', type: 'number', placeholder: '请输入部门ID' },
      { name: 'status', label: '状态', type: 'switch' },
      { name: 'description', label: '描述', type: 'textarea', placeholder: '请输入描述', span: 2, rows: 3 },
    ],
    [editingId],
  )

  // Table columns
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'username',
        header: '用户名',
        cell: ({ row }) => <span className="font-medium">{row.original.username}</span>,
      },
      {
        accessorKey: 'nickname',
        header: '昵称',
      },
      {
        accessorKey: 'gender',
        header: '性别',
        cell: ({ row }) => (row.original.gender === 1 ? '男' : '女'),
      },
      {
        accessorKey: 'phone',
        header: '手机号',
        cell: ({ row }) => row.original.phone || '-',
      },
      {
        accessorKey: 'email',
        header: '邮箱',
        cell: ({ row }) => row.original.email || '-',
      },
      {
        accessorKey: 'status',
        header: '状态',
        cell: ({ row }) =>
          row.original.status === 1 ? (
            <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">启用</Badge>
          ) : (
            <Badge variant="secondary" className="bg-red-500/10 text-red-600 hover:bg-red-500/10">禁用</Badge>
          ),
      },
      {
        accessorKey: 'deptName',
        header: '部门',
        cell: ({ row }) => row.original.deptName || '-',
      },
      {
        accessorKey: 'createTime',
        header: '创建时间',
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {has('system:user:update') && (
                <DropdownMenuItem onClick={() => openEdit(row.original)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
              )}
              {has('system:user:update') && (
                <DropdownMenuItem onClick={() => openResetPassword(row.original.id)}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  重置密码
                </DropdownMenuItem>
              )}
              {has('system:user:delete') && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => openSingleDelete(String(row.original.id))}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [has, openEdit, openResetPassword, openSingleDelete],
  )

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-medium text-foreground">用户管理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理系统用户信息、状态及权限</p>
      </div>

      {/* Search form */}
      <div className="rounded border p-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label>用户名</Label>
            <Input
              placeholder="请输入用户名"
              value={searchForm.username}
              onChange={(e) => setSearchForm((prev) => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>昵称</Label>
            <Input
              placeholder="请输入昵称"
              value={searchForm.nickname}
              onChange={(e) => setSearchForm((prev) => ({ ...prev, nickname: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>手机号</Label>
            <Input
              placeholder="请输入手机号"
              value={searchForm.phone}
              onChange={(e) => setSearchForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>状态</Label>
            <Select
              value={searchForm.status}
              onValueChange={(v) => setSearchForm((prev) => ({ ...prev, status: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">启用</SelectItem>
                <SelectItem value="0">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            重置
          </Button>
          <Button size="sm" onClick={onSearch}>
            <Search className="mr-1.5 h-3.5 w-3.5" />
            搜索
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {has('system:user:create') && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            新增
          </Button>
        )}
        {has('system:user:delete') && (
          <Button
            variant="destructive"
            size="sm"
            disabled={selectedIds.length === 0}
            onClick={openBatchDelete}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            批量删除
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          导出
        </Button>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={query.page ?? 1}
        size={query.size ?? 10}
        loading={loading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
      />

      {/* Create / Edit form */}
      <CrudForm
        open={formOpen}
        onOpenChange={setFormOpen}
        title={formTitle}
        fields={formFields}
        values={formValues}
        loading={formLoading}
        onSubmit={handleFormSubmit}
      />

      {/* Delete confirmation */}
      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        count={deleteIds.length}
        onConfirm={confirmDelete}
      />

      {/* Password reset confirmation */}
      <DeleteConfirm
        open={resetPwdOpen}
        onOpenChange={setResetPwdOpen}
        count={1}
        onConfirm={handleResetPassword}
      />
    </div>
  )
}
