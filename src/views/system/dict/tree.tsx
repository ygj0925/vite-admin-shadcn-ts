import { useEffect, useState, useMemo, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, MoreHorizontal, Bookmark, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DeleteConfirm } from '@/components/delete-confirm'
import { CrudForm } from '@/components/crud-form'
import { DataTable } from '@/components/data-table'
import { getDictPage, addDict, updateDict, deleteDict, clearDictCache, getDictItemPage, type Dict, type DictItem } from '@/apis/system/dict'
import { usePermission } from '@/hooks/use-permission'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'

export default function DictTreePage() {
  const [dictList, setDictList] = useState<Dict[]>([])
  const [loading, setLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')
  const [selectedDict, setSelectedDict] = useState<Dict | null>(null)
  const [dictItems, setDictItems] = useState<DictItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingDict, setEditingDict] = useState<Dict | null>(null)
  const [itemFormOpen, setItemFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<DictItem | null>(null)
  const { has } = usePermission()

  const fetchDicts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getDictPage({ page: 1, size: 9999 })
      setDictList(res.data?.list ?? [])
    } catch {
      // handled
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDictItems = useCallback(async (dictCode: string) => {
    setItemsLoading(true)
    try {
      const res = await getDictItemPage(dictCode, { page: 1, size: 9999 })
      setDictItems(res.data?.list ?? [])
    } catch {
      // handled
    } finally {
      setItemsLoading(false)
    }
  }, [])

  useEffect(() => { fetchDicts() }, [fetchDicts])
  useEffect(() => { if (selectedDict) fetchDictItems(selectedDict.code) }, [selectedDict])

  const filteredList = useMemo(() => {
    if (!searchKey) return dictList
    const lower = searchKey.toLowerCase()
    return dictList.filter((d) => d.name.toLowerCase().includes(lower) || d.code.toLowerCase().includes(lower))
  }, [dictList, searchKey])

  const handleAdd = () => { setEditingDict(null); setFormOpen(true) }
  const handleEdit = (dict: Dict) => { setEditingDict(dict); setFormOpen(true) }
  const handleDelete = async (dict: Dict) => {
    await deleteDict([String(dict.id)])
    toast.success('删除成功')
    fetchDicts()
    if (selectedDict?.id === dict.id) { setSelectedDict(null); setDictItems([]) }
  }
  const handleClearCache = async (dict: Dict) => {
    await clearDictCache(dict.code)
    toast.success('缓存已清除')
  }
  const handleSubmit = async (values: Record<string, any>) => {
    if (editingDict) { await updateDict(editingDict.id, values); toast.success('修改成功') }
    else { await addDict(values); toast.success('新增成功') }
    setFormOpen(false); fetchDicts()
  }

  const itemColumns: ColumnDef<DictItem>[] = useMemo(() => [
    { accessorKey: 'label', header: '标签' },
    { accessorKey: 'value', header: '值' },
    { accessorKey: 'sort', header: '排序', size: 60 },
    {
      accessorKey: 'status', header: '状态', size: 80,
      cell: ({ row }) => <Badge variant={row.original.status === 1 ? 'default' : 'secondary'}>{row.original.status === 1 ? '启用' : '禁用'}</Badge>,
    },
    {
      accessorKey: 'color', header: '颜色', size: 80,
      cell: ({ row }) => row.original.color ? <Badge style={{ backgroundColor: row.original.color }}>{row.original.color}</Badge> : '-',
    },
    { accessorKey: 'description', header: '描述' },
    {
      id: 'actions', header: '操作', size: 100,
      cell: ({ row }) => (
        <div className="flex gap-1">
          {has('system:dict:update') && (
            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(row.original); setItemFormOpen(true) }}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
          {has('system:dict:delete') && (
            <DeleteConfirm onConfirm={async () => {
              await deleteDictItem([String(row.original.id)])
              toast.success('删除成功')
              if (selectedDict) fetchDictItems(selectedDict.code)
            }}>
              <Button variant="ghost" size="sm"><Trash2 className="h-3.5 w-3.5" /></Button>
            </DeleteConfirm>
          )}
        </div>
      ),
    },
  ], [has, selectedDict, fetchDictItems])

  const dictFormFields = [
    { name: 'name', label: '字典名称', required: true },
    { name: 'code', label: '字典标识', required: true, disabled: !!editingDict },
    { name: 'status', label: '状态', type: 'select' as const, options: [{ label: '启用', value: 1 }, { label: '禁用', value: 2 }] },
    { name: 'description', label: '描述', type: 'textarea' as const },
  ]

  const itemFormFields = [
    { name: 'label', label: '标签', required: true },
    { name: 'value', label: '值', required: true },
    { name: 'sort', label: '排序', type: 'number' as const },
    { name: 'status', label: '状态', type: 'select' as const, options: [{ label: '启用', value: 1 }, { label: '禁用', value: 2 }] },
    { name: 'color', label: '颜色' },
    { name: 'description', label: '描述', type: 'textarea' as const },
  ]

  const handleItemSubmit = async (values: Record<string, any>) => {
    if (editingItem) { await updateDictItem(editingItem.id, { ...values, dictCode: selectedDict?.code }); toast.success('修改成功') }
    else { await addDict({ ...values, dictCode: selectedDict?.code }); toast.success('新增成功') }
    setItemFormOpen(false)
    if (selectedDict) fetchDictItems(selectedDict.code)
  }

  return (
    <div className="flex gap-4 h-full">
      <Card className="w-1/3">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>字典列表</span>
            {has('system:dict:create') && (
              <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4 mr-1" /> 新增</Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索字典..." value={searchKey} onChange={(e) => setSearchKey(e.target.value)} className="h-8 pl-8 text-sm" />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="px-1 pb-2 space-y-0.5">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredList.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">暂无字典数据</div>
              ) : (
                filteredList.map((dict) => (
                  <div
                    key={dict.id}
                    onClick={() => setSelectedDict(dict)}
                    className={cn(
                      'group flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer transition-colors',
                      'hover:bg-accent',
                      selectedDict?.id === dict.id && 'bg-accent font-medium'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Bookmark className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{dict.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{dict.code}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {has('system:dict:update') && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(dict) }}>
                            <Edit className="h-4 w-4 mr-2" /> 编辑
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleClearCache(dict) }}>
                          <RefreshCw className="h-4 w-4 mr-2" /> 清除缓存
                        </DropdownMenuItem>
                        {has('system:dict:delete') && (
                          <DeleteConfirm onConfirm={() => handleDelete(dict)}>
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
          <CardTitle className="flex items-center justify-between text-base">
            <span>{selectedDict ? `${selectedDict.name} - 字典项` : '请选择字典'}</span>
            {selectedDict && has('system:dict:create') && (
              <Button size="sm" onClick={() => { setEditingItem(null); setItemFormOpen(true) }}>
                <Plus className="h-4 w-4 mr-1" /> 新增字典项
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDict ? (
            <DataTable columns={itemColumns} data={dictItems} loading={itemsLoading} />
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              请从左侧选择字典
            </div>
          )}
        </CardContent>
      </Card>

      <CrudForm open={formOpen} onOpenChange={setFormOpen} title={editingDict ? '编辑字典' : '新增字典'}
        fields={dictFormFields} initialValues={editingDict ?? {}} onSubmit={handleSubmit} />

      <CrudForm open={itemFormOpen} onOpenChange={setItemFormOpen} title={editingItem ? '编辑字典项' : '新增字典项'}
        fields={itemFormFields} initialValues={editingItem ?? {}} onSubmit={handleItemSubmit} />
    </div>
  )
}
