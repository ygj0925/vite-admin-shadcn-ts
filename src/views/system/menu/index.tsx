import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, ChevronRight, ChevronDown, Pencil, Trash2, RefreshCw, Folder, FileText, Key, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CrudForm, type FormField } from '@/components/crud-form'
import { DeleteConfirm } from '@/components/delete-confirm'
import { usePermission } from '@/hooks/use-permission'
import { getMenuTree, addMenu, updateMenu, deleteMenu, clearMenuCache, type Menu } from '@/apis/system/menu'

const typeMap: Record<number, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  0: { label: '目录', variant: 'default' },
  1: { label: '菜单', variant: 'secondary' },
  2: { label: '按钮', variant: 'outline' },
}

export default function MenuPage() {
  const { has } = usePermission()
  const [data, setData] = useState<Menu[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [formOpen, setFormOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const [formLoading, setFormLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMenuTree()
      setData(res.data)
      // Auto-expand all on first load
      const ids = new Set<number>()
      const collect = (items: Menu[]) => {
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

  const expandAll = () => {
    const ids = new Set<number>()
    const collect = (items: Menu[]) => {
      items.forEach((item) => {
        if (item.children?.length) {
          ids.add(item.id)
          collect(item.children)
        }
      })
    }
    collect(data)
    setExpandedIds(ids)
  }

  const collapseAll = () => setExpandedIds(new Set())

  const handleClearCache = async () => {
    try {
      await clearMenuCache()
      toast.success('缓存已清除')
    } catch {
      // handled
    }
  }

  const openAddForm = (parentId: number = 0) => {
    setFormTitle(parentId === 0 ? '新增根菜单' : '新增子菜单')
    setFormValues({ parentId, type: '0', sort: 0, status: 1, cache: true, hidden: false, alwaysShow: false })
    setFormOpen(true)
  }

  const openEditForm = (menu: Menu) => {
    setFormTitle('编辑菜单')
    setFormValues({
      id: menu.id,
      parentId: menu.parentId,
      title: menu.title,
      type: String(menu.type),
      path: menu.path,
      component: menu.component,
      icon: menu.icon,
      permission: menu.permission,
      sort: menu.sort,
      status: menu.status,
      cache: menu.cache,
      hidden: menu.hidden,
      alwaysShow: menu.alwaysShow,
    })
    setFormOpen(true)
  }

  const handleSubmit = async (values: Record<string, unknown>) => {
    setFormLoading(true)
    try {
      const payload = {
        ...values,
        type: Number(values.type),
        status: Number(values.status),
        sort: Number(values.sort),
      }
      if (values.id) {
        await updateMenu(values.id as number, payload as Partial<Menu>)
        toast.success('更新成功')
      } else {
        await addMenu(payload as Partial<Menu>)
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
      await deleteMenu([String(deleteTarget.id)])
      toast.success('删除成功')
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchData()
    } catch {
      // handled
    }
  }

  const formFields: FormField[] = [
    { name: 'parentId', label: '上级菜单ID', type: 'number', placeholder: '0为根菜单', required: true },
    { name: 'title', label: '菜单标题', type: 'input', placeholder: '请输入菜单标题', required: true },
    {
      name: 'type',
      label: '菜单类型',
      type: 'select',
      required: true,
      options: [
        { label: '目录', value: '0' },
        { label: '菜单', value: '1' },
        { label: '按钮', value: '2' },
      ],
    },
    { name: 'path', label: '路由地址', type: 'input', placeholder: '请输入路由地址' },
    { name: 'component', label: '组件路径', type: 'input', placeholder: '请输入组件路径', hidden: formValues.type === '0' || formValues.type === '2' },
    { name: 'icon', label: '图标', type: 'input', placeholder: '请输入图标名称', hidden: formValues.type === '2' },
    { name: 'permission', label: '权限标识', type: 'input', placeholder: '如: system:user:create', hidden: formValues.type === '0' },
    { name: 'sort', label: '排序', type: 'number', placeholder: '请输入排序号' },
    { name: 'status', label: '状态', type: 'switch' },
    { name: 'cache', label: '缓存', type: 'switch', hidden: formValues.type !== '1' },
    { name: 'hidden', label: '隐藏', type: 'switch', hidden: formValues.type === '2' },
    { name: 'alwaysShow', label: '始终显示', type: 'switch', hidden: formValues.type === '2' },
  ]

  const renderRows = (items: Menu[], depth: number): React.ReactNode[] => {
    return items.flatMap((menu) => {
      const hasChildren = menu.children && menu.children.length > 0
      const isExpanded = expandedIds.has(menu.id)
      const rows: React.ReactNode[] = [
        <TableRow key={menu.id}>
          <TableCell>
            <div className="flex items-center" style={{ paddingLeft: `${depth * 24}px` }}>
              {hasChildren ? (
                <button
                  className="mr-1 p-0.5 hover:bg-muted rounded"
                  onClick={() => toggleExpand(menu.id)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              ) : (
                <span className="w-6" />
              )}
              {menu.type === 0 ? (
                <Folder className="mr-2 h-4 w-4 text-blue-500" />
              ) : menu.type === 1 ? (
                <FileText className="mr-2 h-4 w-4 text-green-500" />
              ) : (
                <Key className="mr-2 h-4 w-4 text-orange-500" />
              )}
              <span className="font-medium">{menu.title}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant={typeMap[menu.type]?.variant ?? 'outline'}>
              {typeMap[menu.type]?.label ?? '未知'}
            </Badge>
          </TableCell>
          <TableCell className="font-mono text-xs">{menu.permission || '-'}</TableCell>
          <TableCell className="font-mono text-xs">{menu.path || '-'}</TableCell>
          <TableCell>{menu.sort}</TableCell>
          <TableCell>
            <Badge variant={menu.status === 1 ? 'default' : 'destructive'}>
              {menu.status === 1 ? '启用' : '禁用'}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1">
              {(menu.type === 0 || menu.type === 1) && has('system:menu:create') && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAddForm(menu.id)}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              {has('system:menu:update') && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(menu)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {has('system:menu:delete') && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => { setDeleteTarget(menu); setDeleteOpen(true) }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>,
      ]
      if (hasChildren && isExpanded) {
        rows.push(...renderRows(menu.children!, depth + 1))
      }
      return rows
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">菜单管理</h1>
        <p className="text-sm text-muted-foreground mt-1">系统菜单与权限配置</p>
      </div>

      <div className="flex items-center gap-2">
        {has('system:menu:create') && (
          <Button onClick={() => openAddForm(0)}>
            <Plus className="mr-2 h-4 w-4" />
            新增根菜单
          </Button>
        )}
        <Button variant="outline" onClick={expandAll}>展开全部</Button>
        <Button variant="outline" onClick={collapseAll}>折叠全部</Button>
        <Button variant="outline" onClick={handleClearCache}>
          <RefreshCw className="mr-2 h-4 w-4" />
          清除缓存
        </Button>
      </div>

      <div className="rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[240px]">菜单标题</TableHead>
              <TableHead className="w-[80px]">类型</TableHead>
              <TableHead className="w-[180px]">权限标识</TableHead>
              <TableHead className="w-[160px]">路由地址</TableHead>
              <TableHead className="w-[80px]">排序</TableHead>
              <TableHead className="w-[80px]">状态</TableHead>
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
        width="max-w-2xl"
      />

      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
    </div>
  )
}
