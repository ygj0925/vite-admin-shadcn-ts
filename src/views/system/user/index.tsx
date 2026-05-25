import { useState, useMemo, useCallback, useEffect } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Download, Upload, Search, RotateCcw, Pencil, KeyRound, MoreHorizontal, UserCog, ChevronRight, ChevronDown, Building2 } from 'lucide-react'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'

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
  importUser,
  assignRoles,
  type User,
  type UserPageQuery,
} from '@/apis/system/user'
import { getDeptTree, type Dept } from '@/apis/system/dept'
import { getRoleDict } from '@/apis/system/role'
import type { LabelValueState } from '@/types/api'

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

  // Dept tree state
  const [deptTree, setDeptTree] = useState<Dept[]>([])
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set())
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>(undefined)

  // Role dict
  const [roleOptions, setRoleOptions] = useState<LabelValueState[]>([])

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
  const [resetPwdLoading, setResetPwdLoading] = useState(false)
  const [resetPwdUserId, setResetPwdUserId] = useState<number | null>(null)
  const [resetPwdValues, setResetPwdValues] = useState<Record<string, unknown>>({})

  // Import sheet state
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)

  // Assign roles dialog state
  const [assignRoleOpen, setAssignRoleOpen] = useState(false)
  const [assignRoleUserId, setAssignRoleUserId] = useState<number | null>(null)
  const [assignRoleSelected, setAssignRoleSelected] = useState<number[]>([])
  const [assignRoleLoading, setAssignRoleLoading] = useState(false)

  // Load dept tree on mount
  useEffect(() => {
    getDeptTree().then((res) => {
      setDeptTree(res.data)
      const ids = new Set<number>()
      const collect = (items: Dept[]) => {
        items.forEach((d) => {
          if (d.children?.length) { ids.add(d.id); collect(d.children) }
        })
      }
      collect(res.data)
      setExpandedDepts(ids)
    }).catch(() => {})
  }, [])

  // Load role options
  useEffect(() => {
    getRoleDict().then((res) => setRoleOptions(res.data)).catch(() => {})
  }, [])

  // Dept tree interactions
  const toggleDept = (id: number) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectDept = (id: number) => {
    const next = selectedDeptId === id ? undefined : id
    setSelectedDeptId(next)
    const params: Partial<UserPageQuery> = {}
    if (searchForm.username) params.username = searchForm.username
    if (searchForm.nickname) params.nickname = searchForm.nickname
    if (searchForm.phone) params.phone = searchForm.phone
    if (searchForm.status) params.status = Number(searchForm.status)
    if (next !== undefined) params.deptId = next
    handleSearch(params)
  }

  const renderDeptTree = (items: Dept[], depth: number): React.ReactNode[] =>
    items.flatMap((dept) => {
      const hasChildren = !!dept.children?.length
      const isExpanded = expandedDepts.has(dept.id)
      const isSelected = selectedDeptId === dept.id
      return [
        <button
          key={dept.id}
          className={`w-full flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-muted text-left ${isSelected ? 'bg-muted font-medium text-primary' : ''}`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => selectDept(dept.id)}
        >
          <span
            className="shrink-0"
            onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleDept(dept.id) }}
          >
            {hasChildren
              ? isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
              : <span className="w-3.5 inline-block" />}
          </span>
          <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{dept.name}</span>
        </button>,
        ...(hasChildren && isExpanded ? renderDeptTree(dept.children!, depth + 1) : []),
      ]
    })

  // Search handlers
  const onSearch = useCallback(() => {
    const params: Partial<UserPageQuery> = {}
    if (searchForm.username) params.username = searchForm.username
    if (searchForm.nickname) params.nickname = searchForm.nickname
    if (searchForm.phone) params.phone = searchForm.phone
    if (searchForm.status) params.status = Number(searchForm.status)
    if (selectedDeptId !== undefined) params.deptId = selectedDeptId
    handleSearch(params)
  }, [searchForm, selectedDeptId, handleSearch])

  const onReset = useCallback(() => {
    setSearchForm({ username: '', nickname: '', phone: '', status: '' })
    setSelectedDeptId(undefined)
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
      gender: String(user.gender),
      phone: user.phone,
      email: user.email,
      deptId: String(user.deptId),
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
    setResetPwdValues({})
    setResetPwdOpen(true)
  }, [])

  const handleResetPasswordSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      if (!resetPwdUserId) return
      setResetPwdLoading(true)
      try {
        await resetPassword(resetPwdUserId, values.newPassword as string)
        toast.success('密码重置成功')
        setResetPwdOpen(false)
      } catch {
        // Error handled by interceptor
      } finally {
        setResetPwdLoading(false)
      }
    },
    [resetPwdUserId],
  )

  // Import
  const handleImport = async () => {
    if (!importFile) { toast.warning('请选择文件'); return }
    setImportLoading(true)
    try {
      await importUser(importFile)
      toast.success('导入成功')
      setImportOpen(false)
      setImportFile(null)
      fetchData()
    } catch {
      // Error handled by interceptor
    } finally {
      setImportLoading(false)
    }
  }

  // Assign roles
  const openAssignRole = useCallback((user: User) => {
    setAssignRoleUserId(user.id)
    setAssignRoleSelected(user.roles?.map((r) => r.id) ?? [])
    setAssignRoleOpen(true)
  }, [])

  const handleAssignRole = async () => {
    if (!assignRoleUserId) return
    setAssignRoleLoading(true)
    try {
      await assignRoles(assignRoleUserId, assignRoleSelected)
      toast.success('分配角色成功')
      setAssignRoleOpen(false)
      fetchData()
    } catch {
      // Error handled by interceptor
    } finally {
      setAssignRoleLoading(false)
    }
  }

  const toggleRoleSelect = (id: number) => {
    setAssignRoleSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  // Form fields
  const deptOptions = useMemo(() => {
    const flat: { label: string; value: string | number }[] = []
    const collect = (items: Dept[], prefix = '') => {
      items.forEach((d) => {
        flat.push({ label: prefix + d.name, value: String(d.id) })
        if (d.children?.length) collect(d.children, prefix + d.name + ' / ')
      })
    }
    collect(deptTree)
    return flat
  }, [deptTree])

  const formFields: FormField[] = useMemo(
    () => [
      { name: 'username', label: '用户名', type: 'input', required: true, placeholder: '请输入用户名', span: 2, disabled: !!editingId },
      { name: 'nickname', label: '昵称', type: 'input', required: true, placeholder: '请输入昵称', span: 2 },
      { name: 'password', label: '密码', type: 'password', required: !editingId, placeholder: '请输入密码', hidden: !!editingId },
      { name: 'gender', label: '性别', type: 'select', options: genderOptions, placeholder: '请选择性别' },
      { name: 'phone', label: '手机号', type: 'input', placeholder: '请输入手机号' },
      { name: 'email', label: '邮箱', type: 'input', placeholder: '请输入邮箱' },
      { name: 'deptId', label: '所属部门', type: 'select', options: deptOptions, placeholder: '请选择部门' },
      { name: 'status', label: '状态', type: 'switch' },
      { name: 'description', label: '描述', type: 'textarea', placeholder: '请输入描述', span: 2, rows: 3 },
    ],
    [editingId, deptOptions],
  )

  const resetPwdFields: FormField[] = [
    { name: 'newPassword', label: '新密码', type: 'password', required: true, placeholder: '请输入新密码', span: 2 },
  ]

  // Table columns
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'username',
        header: '用户名',
        cell: ({ row }) => <span className="font-medium">{row.original.username}</span>,
      },
      { accessorKey: 'nickname', header: '昵称' },
      {
        accessorKey: 'gender',
        header: '性别',
        cell: ({ row }) => (row.original.gender === 1 ? '男' : row.original.gender === 2 ? '女' : '-'),
      },
      { accessorKey: 'phone', header: '手机号', cell: ({ row }) => row.original.phone || '-' },
      { accessorKey: 'email', header: '邮箱', cell: ({ row }) => row.original.email || '-' },
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
      { accessorKey: 'deptName', header: '部门', cell: ({ row }) => row.original.deptName || '-' },
      { accessorKey: 'createTime', header: '创建时间' },
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
                  <Pencil className="mr-2 h-4 w-4" />编辑
                </DropdownMenuItem>
              )}
              {has('system:user:update') && (
                <DropdownMenuItem onClick={() => openResetPassword(row.original.id)}>
                  <KeyRound className="mr-2 h-4 w-4" />重置密码
                </DropdownMenuItem>
              )}
              {has('system:user:update') && (
                <DropdownMenuItem onClick={() => openAssignRole(row.original)}>
                  <UserCog className="mr-2 h-4 w-4" />分配角色
                </DropdownMenuItem>
              )}
              {has('system:user:delete') && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => openSingleDelete(String(row.original.id))}
                >
                  <Trash2 className="mr-2 h-4 w-4" />删除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [has, openEdit, openResetPassword, openAssignRole, openSingleDelete],
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">用户管理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理系统用户信息、状态及权限</p>
      </div>

      <div className="flex gap-4">
        {/* Dept tree */}
        <div className="w-48 shrink-0 rounded border p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">部门筛选</div>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <button
              className={`w-full flex items-center gap-1.5 px-2 py-1 text-sm rounded hover:bg-muted text-left ${selectedDeptId === undefined ? 'font-medium text-primary' : ''}`}
              onClick={() => { setSelectedDeptId(undefined); onReset() }}
            >
              <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              全部
            </button>
            {renderDeptTree(deptTree, 0)}
          </ScrollArea>
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-0 space-y-4">
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
                  <SelectTrigger><SelectValue placeholder="全部" /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onReset}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />重置
              </Button>
              <Button size="sm" onClick={onSearch}>
                <Search className="mr-1.5 h-3.5 w-3.5" />搜索
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {has('system:user:create') && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />新增
              </Button>
            )}
            {has('system:user:delete') && (
              <Button variant="destructive" size="sm" disabled={selectedIds.length === 0} onClick={openBatchDelete}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />批量删除
              </Button>
            )}
            {has('system:user:import') && (
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="mr-1.5 h-3.5 w-3.5" />导入
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-1.5 h-3.5 w-3.5" />导出
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
        </div>
      </div>

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

      {/* Password reset form */}
      <CrudForm
        open={resetPwdOpen}
        onOpenChange={setResetPwdOpen}
        title="重置密码"
        fields={resetPwdFields}
        values={resetPwdValues}
        loading={resetPwdLoading}
        onSubmit={handleResetPasswordSubmit}
        width="max-w-sm"
      />

      {/* Delete confirmation */}
      <DeleteConfirm open={deleteOpen} onOpenChange={setDeleteOpen} count={deleteIds.length} onConfirm={confirmDelete} />

      {/* Import sheet */}
      <Sheet open={importOpen} onOpenChange={setImportOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>导入用户</SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <p className="text-sm text-muted-foreground">请上传 Excel 格式的用户数据文件（.xlsx / .xls）</p>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            />
            {importFile && (
              <p className="text-sm text-foreground">已选择：{importFile.name}</p>
            )}
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => { setImportOpen(false); setImportFile(null) }}>取消</Button>
            <Button onClick={handleImport} disabled={importLoading}>
              {importLoading ? '导入中...' : '确认导入'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Assign roles dialog */}
      <Dialog open={assignRoleOpen} onOpenChange={setAssignRoleOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>分配角色</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-64">
            <div className="space-y-2 py-2">
              {roleOptions.map((role) => (
                <div key={role.value} className="flex items-center gap-2 px-1">
                  <Checkbox
                    id={`role-${role.value}`}
                    checked={assignRoleSelected.includes(Number(role.value))}
                    onCheckedChange={() => toggleRoleSelect(Number(role.value))}
                  />
                  <label htmlFor={`role-${role.value}`} className="text-sm cursor-pointer">
                    {role.label}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignRoleOpen(false)}>取消</Button>
            <Button onClick={handleAssignRole} disabled={assignRoleLoading}>
              {assignRoleLoading ? '保存中...' : '确认'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
