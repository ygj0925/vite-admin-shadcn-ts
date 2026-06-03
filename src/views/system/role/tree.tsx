import { useEffect, useState, useMemo, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, MoreHorizontal, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DeleteConfirm } from '@/components/delete-confirm'
import { CrudForm } from '@/components/crud-form'
import { getRolePage, addRole, updateRole, deleteRole, type Role } from '@/apis/system/role'
import { usePermission } from '@/hooks/use-permission'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function RoleTreePage() {
  const [roleList, setRoleList] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const { has } = usePermission()

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getRolePage({ page: 1, size: 9999, sort: ['sort,asc'] })
      setRoleList(res.data?.list ?? [])
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  const filteredList = useMemo(() => {
    if (!searchKey) return roleList
    const lower = searchKey.toLowerCase()
    return roleList.filter((r) => r.name.toLowerCase().includes(lower) || r.code.toLowerCase().includes(lower))
  }, [roleList, searchKey])

  const handleAdd = () => {
    setEditingRole(null)
    setFormOpen(true)
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setFormOpen(true)
  }

  const handleDelete = async (role: Role) => {
    await deleteRole([String(role.id)])
    toast.success('删除成功')
    fetchRoles()
    if (selectedRole?.id === role.id) setSelectedRole(null)
  }

  const handleSubmit = async (values: Record<string, any>) => {
    if (editingRole) {
      await updateRole(editingRole.id, values)
      toast.success('修改成功')
    } else {
      await addRole(values)
      toast.success('新增成功')
    }
    setFormOpen(false)
    fetchRoles()
  }

  const formFields = [
    { name: 'name', label: '角色名称', required: true },
    { name: 'code', label: '角色标识', required: true },
    { name: 'sort', label: '排序', type: 'number' as const },
    { name: 'status', label: '状态', type: 'select' as const, options: [{ label: '启用', value: 1 }, { label: '禁用', value: 2 }] },
    { name: 'description', label: '描述', type: 'textarea' as const },
  ]

  return (
    <div className="flex gap-4 h-full">
      <Card className="w-1/3">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>角色列表</span>
            {has('system:role:create') && (
              <Button size="sm" onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-1" /> 新增
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索角色..." value={searchKey} onChange={(e) => setSearchKey(e.target.value)} className="h-8 pl-8 text-sm" />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="px-1 pb-2 space-y-0.5">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredList.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">暂无角色数据</div>
              ) : (
                filteredList.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={cn(
                      'group flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer transition-colors',
                      'hover:bg-accent',
                      selectedRole?.id === role.id && 'bg-accent font-medium'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{role.name}</span>
                      <Badge variant={role.status === 1 ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                        {role.status === 1 ? '启用' : '禁用'}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {has('system:role:update') && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(role) }}>
                            <Edit className="h-4 w-4 mr-2" /> 编辑
                          </DropdownMenuItem>
                        )}
                        {has('system:role:delete') && (
                          <DeleteConfirm onConfirm={() => handleDelete(role)}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> 删除
                            </DropdownMenuItem>
                          </DeleteConfirm>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-base">
            {selectedRole ? `${selectedRole.name} - 详情` : '请选择角色'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedRole ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm text-muted-foreground">角色名称</span><p className="mt-1 font-medium">{selectedRole.name}</p></div>
                <div><span className="text-sm text-muted-foreground">角色标识</span><p className="mt-1 font-mono text-sm">{selectedRole.code}</p></div>
                <div><span className="text-sm text-muted-foreground">状态</span><p className="mt-1"><Badge variant={selectedRole.status === 1 ? 'default' : 'secondary'}>{selectedRole.status === 1 ? '启用' : '禁用'}</Badge></p></div>
                <div><span className="text-sm text-muted-foreground">排序</span><p className="mt-1 font-medium">{selectedRole.sort}</p></div>
              </div>
              {selectedRole.description && (
                <div><span className="text-sm text-muted-foreground">描述</span><p className="mt-1">{selectedRole.description}</p></div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              请从左侧选择角色
            </div>
          )}
        </CardContent>
      </Card>

      <CrudForm
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingRole ? '编辑角色' : '新增角色'}
        fields={formFields}
        initialValues={editingRole ?? {}}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
