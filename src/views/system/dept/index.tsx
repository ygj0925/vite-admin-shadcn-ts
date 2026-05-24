import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, ChevronRight, ChevronDown, Pencil, Trash2, Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CrudForm, type FormField } from '@/components/crud-form'
import { DeleteConfirm } from '@/components/delete-confirm'
import { usePermission } from '@/hooks/use-permission'
import { getDeptTree, addDept, updateDept, deleteDept, type Dept } from '@/apis/system/dept'

export default function DeptPage() {
  const { has } = usePermission()
  const [data, setData] = useState<Dept[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [formOpen, setFormOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const [formLoading, setFormLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Dept | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getDeptTree()
      setData(res.data)
      const ids = new Set<number>()
      const collect = (items: Dept[]) => {
        items.forEach((item) => {
          if (item.children?.length) {
            ids.add(item.id)
            collect(item.children)
          }
        })
      }
      collect(res.data)
      setExpandedIds(ids)
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openAddForm = (parentId: number = 0) => {
    setFormTitle(parentId === 0 ? '新增根部门' : '新增子部门')
    setFormValues({ parentId, sort: 0, status: 1 })
    setFormOpen(true)
  }

  const openEditForm = (dept: Dept) => {
    setFormTitle('编辑部门')
    setFormValues({
      id: dept.id,
      parentId: dept.parentId,
      name: dept.name,
      sort: dept.sort,
      status: dept.status,
      leader: dept.leader,
      phone: dept.phone,
      email: dept.email,
    })
    setFormOpen(true)
  }

  const handleSubmit = async (values: Record<string, unknown>) => {
    setFormLoading(true)
    try {
      const payload = {
        ...values,
        status: Number(values.status),
        sort: Number(values.sort),
      }
      if (values.id) {
        await updateDept(values.id as number, payload as Partial<Dept>)
        toast.success('更新成功')
      } else {
        await addDept(payload as Partial<Dept>)
        toast.success('新增成功')
      }
      setFormOpen(false)
      fetchData()
    } catch {
      // handled
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteDept([String(deleteTarget.id)])
      toast.success('删除成功')
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchData()
    } catch {
      // handled
    }
  }

  const formFields: FormField[] = [
    { name: 'parentId', label: '上级部门ID', type: 'number', placeholder: '0为根部门', required: true },
    { name: 'name', label: '部门名称', type: 'input', placeholder: '请输入部门名称', required: true },
    { name: 'sort', label: '排序', type: 'number', placeholder: '请输入排序号' },
    { name: 'status', label: '状态', type: 'switch' },
    { name: 'leader', label: '负责人', type: 'input', placeholder: '请输入负责人' },
    { name: 'phone', label: '联系电话', type: 'input', placeholder: '请输入联系电话' },
    { name: 'email', label: '邮箱', type: 'input', placeholder: '请输入邮箱' },
  ]

  const renderRows = (items: Dept[], depth: number): React.ReactNode[] => {
    return items.flatMap((dept) => {
      const hasChildren = dept.children && dept.children.length > 0
      const isExpanded = expandedIds.has(dept.id)
      const rows: React.ReactNode[] = [
        <TableRow key={dept.id}>
          <TableCell>
            <div className="flex items-center" style={{ paddingLeft: `${depth * 24}px` }}>
              {hasChildren ? (
                <button
                  className="mr-1 p-0.5 hover:bg-muted rounded"
                  onClick={() => toggleExpand(dept.id)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              ) : (
                <span className="w-6" />
              )}
              <Building2 className="mr-2 h-4 w-4 text-blue-500" />
              <span className="font-medium">{dept.name}</span>
            </div>
          </TableCell>
          <TableCell>{dept.sort}</TableCell>
          <TableCell>
            <Badge variant={dept.status === 1 ? 'default' : 'destructive'}>
              {dept.status === 1 ? '启用' : '禁用'}
            </Badge>
          </TableCell>
          <TableCell>{dept.leader || '-'}</TableCell>
          <TableCell>{dept.phone || '-'}</TableCell>
          <TableCell>{dept.email || '-'}</TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1">
              {has('system:dept:create') && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAddForm(dept.id)}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              {has('system:dept:update') && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(dept)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {has('system:dept:delete') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => { setDeleteTarget(dept); setDeleteOpen(true) }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>,
      ]
      if (hasChildren && isExpanded) {
        rows.push(...renderRows(dept.children!, depth + 1))
      }
      return rows
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">部门管理</h1>
        <p className="text-sm text-muted-foreground mt-1">组织架构管理</p>
      </div>

      <div className="flex items-center gap-2">
        {has('system:dept:create') && (
          <Button onClick={() => openAddForm(0)}>
            <Plus className="mr-2 h-4 w-4" />
            新增根部门
          </Button>
        )}
      </div>

      <div className="rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">部门名称</TableHead>
              <TableHead className="w-[80px]">排序</TableHead>
              <TableHead className="w-[80px]">状态</TableHead>
              <TableHead className="w-[120px]">负责人</TableHead>
              <TableHead className="w-[140px]">联系电话</TableHead>
              <TableHead className="w-[180px]">邮箱</TableHead>
              <TableHead className="w-[140px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              renderRows(data, 0)
            )}
          </TableBody>
        </Table>
      </div>

      <CrudForm
        open={formOpen}
        onOpenChange={setFormOpen}
        title={formTitle}
        fields={formFields}
        values={formValues}
        loading={formLoading}
        onSubmit={handleSubmit}
      />

      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
    </div>
  )
}
