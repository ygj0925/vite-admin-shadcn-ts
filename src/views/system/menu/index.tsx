import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { Plus, ChevronRight, ChevronDown, Pencil, Trash2, RefreshCw, Folder, FileText, Key, Loader2, Search, List, ListTree } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CrudForm, type FormField } from '@/components/crud-form'
import { DeleteConfirm } from '@/components/delete-confirm'
import { usePermission } from '@/hooks/use-permission'
import { getMenuTree, addMenu, updateMenu, deleteMenu, clearMenuCache, type Menu } from '@/apis/system/menu'
import { SvgIcon } from '@/components/svg-icon'

const typeMap: Record<number, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  1: { label: '目录', variant: 'default' },
  2: { label: '菜单', variant: 'secondary' },
  3: { label: '按钮', variant: 'outline' },
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

  // 搜索状态
  const [searchTitle, setSearchTitle] = useState('')
  const [searchPath, setSearchPath] = useState('')
  const [searchPermission, setSearchPermission] = useState('')

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

  // 搜索过滤
  const searchData = useCallback((items: Menu[], title: string, path: string, permission: string): Menu[] => {
    return items.reduce((acc: Menu[], item) => {
      const titleMatch = !title || item.title?.toLowerCase().includes(title.toLowerCase())
      const pathMatch = !path || item.path?.toLowerCase().includes(path.toLowerCase())
      const permissionMatch = !permission || item.permission?.toLowerCase().includes(permission.toLowerCase())

      if (titleMatch && pathMatch && permissionMatch) {
        acc.push({ ...item })
      } else if (item.children) {
        const filteredChildren = searchData(item.children, title, path, permission)
        if (filteredChildren.length > 0) {
          acc.push({ ...item, children: filteredChildren })
        }
      }
      return acc
    }, [])
  }, [])

  const filteredData = useMemo(() => {
    if (!searchTitle && !searchPath && !searchPermission) return data
    return searchData(data, searchTitle, searchPath, searchPermission)
  }, [data, searchTitle, searchPath, searchPermission, searchData])

  const resetSearch = () => {
    setSearchTitle('')
    setSearchPath('')
    setSearchPermission('')
  }

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
    setFormValues({ parentId, type: '1', sort: 0, status: 1, cache: true, hidden: false, alwaysShow: false })
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
        { label: '目录', value: '1' },
        { label: '菜单', value: '2' },
        { label: '按钮', value: '3' },
      ],
    },
    { name: 'path', label: '路由地址', type: 'input', placeholder: '请输入路由地址' },
    { name: 'name', label: '组件名称', type: 'input', placeholder: '请输入组件名称', hidden: formValues.type !== '2' },
    { name: 'component', label: '组件路径', type: 'input', placeholder: '请输入组件路径', hidden: formValues.type !== '2' },
    { name: 'icon', label: '图标', type: 'input', placeholder: '请输入图标名称', hidden: formValues.type === '3' },
    { name: 'permission', label: '权限标识', type: 'input', placeholder: '如: system:user:create', hidden: formValues.type === '1' },
    { name: 'sort', label: '排序', type: 'number', placeholder: '请输入排序号' },
    { name: 'status', label: '状态', type: 'switch' },
    { name: 'isExternal', label: '外链', type: 'switch', hidden: formValues.type === '3' },
    { name: 'isCache', label: '缓存', type: 'switch', hidden: formValues.type !== '2' },
    { name: 'isHidden', label: '隐藏', type: 'switch', hidden: formValues.type === '3' },
    { name: 'alwaysShow', label: '始终显示', type: 'switch', hidden: formValues.type === '3' },
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
              {menu.icon && (
                <SvgIcon name={menu.icon} className="mr-2 h-4 w-4" />
              )}
              <span className="font-medium">{menu.title}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant={typeMap[menu.type]?.variant ?? 'outline'}>
              {typeMap[menu.type]?.label ?? '未知'}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge variant={menu.status === 1 ? 'default' : 'destructive'}>
              {menu.status === 1 ? '启用' : '禁用'}
            </Badge>
          </TableCell>
          <TableCell className="font-mono text-xs">{menu.path || '-'}</TableCell>
          <TableCell className="font-mono text-xs">{menu.name || '-'}</TableCell>
          <TableCell className="font-mono text-xs">{menu.component || '-'}</TableCell>
          <TableCell className="font-mono text-xs">{menu.permission || '-'}</TableCell>
          <TableCell className="text-center">
            {menu.isExternal ? (
              <Badge variant="default" className="text-[10px]">是</Badge>
            ) : (
              <Badge variant="destructive" className="text-[10px]">否</Badge>
            )}
          </TableCell>
          <TableCell className="text-center">
            {menu.isHidden ? (
              <Badge variant="default" className="text-[10px]">是</Badge>
            ) : (
              <Badge variant="destructive" className="text-[10px]">否</Badge>
            )}
          </TableCell>
          <TableCell className="text-center">
            {menu.isCache ? (
              <Badge variant="default" className="text-[10px]">是</Badge>
            ) : (
              <Badge variant="destructive" className="text-[10px]">否</Badge>
            )}
          </TableCell>
          <TableCell>{menu.sort}</TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1">
              {has('system:menu:update') && (
                <Button variant="ghost" size="sm" onClick={() => openEditForm(menu)}>修改</Button>
              )}
              {has('system:menu:delete') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => { setDeleteTarget(menu); setDeleteOpen(true) }}
                >
                  删除
                </Button>
              )}
              {(menu.type === 1 || menu.type === 2) && has('system:menu:create') && (
                <Button variant="ghost" size="sm" onClick={() => openAddForm(menu.id)}>新增</Button>
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

      {/* 搜索栏 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索菜单标题"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="h-8 w-48 pl-8"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索路由地址"
            value={searchPath}
            onChange={(e) => setSearchPath(e.target.value)}
            className="h-8 w-48 pl-8"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索权限标识"
            value={searchPermission}
            onChange={(e) => setSearchPermission(e.target.value)}
            className="h-8 w-48 pl-8"
          />
        </div>
        <Button variant="outline" size="sm" onClick={resetSearch}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> 重置
        </Button>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center gap-2">
        {has('system:menu:create') && (
          <Button size="sm" onClick={() => openAddForm(0)}>
            <Plus className="mr-2 h-4 w-4" />
            新增
          </Button>
        )}
        {has('system:menu:clearCache') && (
          <Button variant="outline" size="sm" onClick={handleClearCache}>
            <RefreshCw className="mr-2 h-4 w-4" />
            清除缓存
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={expandAll}>
          <ListTree className="mr-2 h-4 w-4" /> 展开
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>
          <List className="mr-2 h-4 w-4" /> 折叠
        </Button>
      </div>

      <div className="rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">菜单标题</TableHead>
              <TableHead className="w-[70px]">类型</TableHead>
              <TableHead className="w-[70px]">状态</TableHead>
              <TableHead className="w-[140px]">路由地址</TableHead>
              <TableHead className="w-[120px]">组件名称</TableHead>
              <TableHead className="w-[160px]">组件路径</TableHead>
              <TableHead className="w-[160px]">权限标识</TableHead>
              <TableHead className="w-[60px]">外链</TableHead>
              <TableHead className="w-[60px]">隐藏</TableHead>
              <TableHead className="w-[60px]">缓存</TableHead>
              <TableHead className="w-[60px]">排序</TableHead>
              <TableHead className="w-[160px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              renderRows(filteredData, 0)
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
