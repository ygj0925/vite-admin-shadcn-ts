import { useState, useMemo, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Search, RotateCcw, Pencil, ShieldCheck, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { DataTable } from '@/components/data-table'
import { CrudForm, type FormField } from '@/components/crud-form'
import { DeleteConfirm } from '@/components/delete-confirm'
import { CheckboxTree, type TreeNode } from '@/components/checkbox-tree'
import { useCrud } from '@/hooks/use-crud'
import { usePermission } from '@/hooks/use-permission'

import {
  getRolePage,
  addRole,
  updateRole,
  deleteRole,
  getPermissionTree,
  updatePermission,
  type Role,
  type RolePageQuery,
} from '@/apis/system/role'

const statusOptions = [
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' },
]

export default function RolePage() {
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
  } = useCrud<Role, RolePageQuery>({
    listApi: getRolePage,
    deleteApi: deleteRole,
  })

  // Search form state
  const [searchForm, setSearchForm] = useState({
    name: '',
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

  // Permission dialog state
  const [permOpen, setPermOpen] = useState(false)
  const [permRoleId, setPermRoleId] = useState<number | null>(null)
  const [permRoleName, setPermRoleName] = useState('')
  const [permLoading, setPermLoading] = useState(false)
  const [permTree, setPermTree] = useState<TreeNode[]>([])
  const [permChecked, setPermChecked] = useState<string[]>([])
  const [permFetching, setPermFetching] = useState(false)

  // Search handlers
  const onSearch = useCallback(() => {
    const params: Partial<RolePageQuery> = {}
    if (searchForm.name) params.name = searchForm.name
    if (searchForm.status) params.status = Number(searchForm.status)
    handleSearch(params)
  }, [searchForm, handleSearch])

  const onReset = useCallback(() => {
    setSearchForm({ name: '', status: '' })
    handleReset()
  }, [handleReset])

  // Create / Edit
  const openCreate = useCallback(() => {
    setEditingId(null)
    setFormTitle('新增角色')
    setFormValues({ sort: 0, status: 1 })
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((role: Role) => {
    setEditingId(role.id)
    setFormTitle('编辑角色')
    setFormValues({
      name: role.name,
      code: role.code,
      sort: role.sort,
      status: role.status,
      description: role.description,
    })
    setFormOpen(true)
  }, [])

  const handleFormSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      setFormLoading(true)
      try {
        if (editingId) {
          await updateRole(editingId, values as Partial<Role>)
          toast.success('更新成功')
        } else {
          await addRole(values as Partial<Role>)
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

  // Permission management
  const openPermission = useCallback(async (role: Role) => {
    setPermRoleId(role.id)
    setPermRoleName(role.name)
    setPermChecked(role.permissions || [])
    setPermOpen(true)
    setPermFetching(true)
    try {
      const tree = await getPermissionTree()
      setPermTree(tree as unknown as TreeNode[])
    } catch {
      setPermTree([])
    } finally {
      setPermFetching(false)
    }
  }, [])

  const handlePermSubmit = useCallback(async () => {
    if (!permRoleId) return
    setPermLoading(true)
    try {
      await updatePermission(permRoleId, permChecked)
      toast.success('权限配置已更新')
      setPermOpen(false)
    } catch {
      // Error handled by interceptor
    } finally {
      setPermLoading(false)
    }
  }, [permRoleId, permChecked])

  // Form fields
  const formFields: FormField[] = useMemo(
    () => [
      { name: 'name', label: '角色名称', type: 'input', required: true, placeholder: '请输入角色名称', span: 2 },
      { name: 'code', label: '角色编码', type: 'input', required: true, placeholder: '请输入角色编码', span: 2, disabled: !!editingId },
      { name: 'sort', label: '排序', type: 'number', placeholder: '请输入排序值' },
      { name: 'status', label: '状态', type: 'select', options: statusOptions, required: true, placeholder: '请选择状态' },
      { name: 'description', label: '描述', type: 'textarea', placeholder: '请输入角色描述', span: 2, rows: 3 },
    ],
    [editingId],
  )

  // Table columns
  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '角色名称',
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'code',
        header: '角色编码',
        cell: ({ row }) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.original.code}</code>,
      },
      {
        accessorKey: 'sort',
        header: '排序',
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
        accessorKey: 'description',
        header: '描述',
        cell: ({ row }) => (
          <span className="text-muted-foreground line-clamp-1 max-w-[200px]">{row.original.description || '-'}</span>
        ),
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
              {has('system:role:update') && (
                <DropdownMenuItem onClick={() => openEdit(row.original)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
              )}
              {has('system:role:update') && (
                <DropdownMenuItem onClick={() => openPermission(row.original)}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  权限配置
                </DropdownMenuItem>
              )}
              {has('system:role:delete') && (
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
    [has, openEdit, openPermission, openSingleDelete],
  )

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-medium text-foreground">角色管理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理系统角色及权限配置</p>
      </div>

      {/* Search form */}
      <div className="rounded border p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>角色名称</Label>
            <Input
              placeholder="请输入角色名称"
              value={searchForm.name}
              onChange={(e) => setSearchForm((prev) => ({ ...prev, name: e.target.value }))}
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
        {has('system:role:create') && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            新增
          </Button>
        )}
        {has('system:role:delete') && (
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

      {/* Permission tree dialog */}
      <Dialog open={permOpen} onOpenChange={setPermOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>权限配置 - {permRoleName}</DialogTitle>
          </DialogHeader>
          {permFetching ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              加载中...
            </div>
          ) : permTree.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              暂无权限数据
            </div>
          ) : (
            <CheckboxTree
              data={permTree}
              checked={permChecked}
              onCheckedChange={setPermChecked}
              className="border rounded-md p-2"
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermOpen(false)}>
              取消
            </Button>
            <Button disabled={permLoading || permFetching} onClick={handlePermSubmit}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
