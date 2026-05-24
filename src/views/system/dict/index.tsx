import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, Book, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CrudForm, type FormField } from '@/components/crud-form'
import { DeleteConfirm } from '@/components/delete-confirm'
import { usePermission } from '@/hooks/use-permission'
import {
  getDictPage,
  addDict,
  updateDict,
  deleteDict,
  getDictItemPage,
  addDictItem,
  updateDictItem,
  deleteDictItem,
  type Dict,
  type DictItem,
} from '@/apis/system/dict'

export default function DictPage() {
  const { has } = usePermission()

  // Dict state
  const [dictList, setDictList] = useState<Dict[]>([])
  const [dictTotal, setDictTotal] = useState(0)
  const [dictPage, setDictPage] = useState(1)
  const [dictLoading, setDictLoading] = useState(false)
  const [selectedDict, setSelectedDict] = useState<Dict | null>(null)
  const [dictFormOpen, setDictFormOpen] = useState(false)
  const [dictFormTitle, setDictFormTitle] = useState('')
  const [dictFormValues, setDictFormValues] = useState<Record<string, unknown>>({})
  const [dictFormLoading, setDictFormLoading] = useState(false)
  const [dictDeleteOpen, setDictDeleteOpen] = useState(false)
  const [dictDeleteTarget, setDictDeleteTarget] = useState<Dict | null>(null)

  // DictItem state
  const [itemList, setItemList] = useState<DictItem[]>([])
  const [itemTotal, setItemTotal] = useState(0)
  const [itemPage, setItemPage] = useState(1)
  const [itemLoading, setItemLoading] = useState(false)
  const [itemFormOpen, setItemFormOpen] = useState(false)
  const [itemFormTitle, setItemFormTitle] = useState('')
  const [itemFormValues, setItemFormValues] = useState<Record<string, unknown>>({})
  const [itemFormLoading, setItemFormLoading] = useState(false)
  const [itemDeleteOpen, setItemDeleteOpen] = useState(false)
  const [itemDeleteTarget, setItemDeleteTarget] = useState<DictItem | null>(null)

  const pageSize = 10

  // Fetch dicts
  const fetchDicts = useCallback(async () => {
    setDictLoading(true)
    try {
      const res = await getDictPage({ page: dictPage, size: pageSize })
      setDictList(res.data.list)
      setDictTotal(res.data.total)
    } catch {
      // handled
    } finally {
      setDictLoading(false)
    }
  }, [dictPage])

  // Fetch items for selected dict
  const fetchItems = useCallback(async () => {
    if (!selectedDict) return
    setItemLoading(true)
    try {
      const res = await getDictItemPage(selectedDict.code, { page: itemPage, size: pageSize })
      setItemList(res.data.list)
      setItemTotal(res.data.total)
    } catch {
      // handled
    } finally {
      setItemLoading(false)
    }
  }, [selectedDict, itemPage])

  useEffect(() => { fetchDicts() }, [fetchDicts])
  useEffect(() => { fetchItems() }, [fetchItems])

  // Select first dict when data loads
  useEffect(() => {
    if (dictList.length > 0 && !selectedDict) {
      setSelectedDict(dictList[0])
    }
  }, [dictList, selectedDict])

  // Reset item page when selected dict changes
  useEffect(() => {
    setItemPage(1)
  }, [selectedDict?.code])

  // --- Dict CRUD ---
  const openAddDict = () => {
    setDictFormTitle('新增字典')
    setDictFormValues({ status: 1 })
    setDictFormOpen(true)
  }

  const openEditDict = (dict: Dict) => {
    setDictFormTitle('编辑字典')
    setDictFormValues({
      id: dict.id,
      name: dict.name,
      code: dict.code,
      status: dict.status,
      description: dict.description,
    })
    setDictFormOpen(true)
  }

  const handleDictSubmit = async (values: Record<string, unknown>) => {
    setDictFormLoading(true)
    try {
      const payload = { ...values, status: Number(values.status) }
      if (values.id) {
        await updateDict(values.id as number, payload as Partial<Dict>)
        toast.success('更新成功')
      } else {
        await addDict(payload as Partial<Dict>)
        toast.success('新增成功')
      }
      setDictFormOpen(false)
      fetchDicts()
    } catch {
      // handled
    } finally {
      setDictFormLoading(false)
    }
  }

  const handleDictDelete = async () => {
    if (!dictDeleteTarget) return
    try {
      await deleteDict([String(dictDeleteTarget.id)])
      toast.success('删除成功')
      setDictDeleteOpen(false)
      setDictDeleteTarget(null)
      if (selectedDict?.id === dictDeleteTarget.id) {
        setSelectedDict(null)
      }
      fetchDicts()
    } catch {
      // handled
    }
  }

  const dictFields: FormField[] = [
    { name: 'name', label: '字典名称', type: 'input', placeholder: '请输入字典名称', required: true },
    { name: 'code', label: '字典编码', type: 'input', placeholder: '请输入字典编码', required: true, disabled: !!dictFormValues.id },
    { name: 'status', label: '状态', type: 'switch' },
    { name: 'description', label: '描述', type: 'textarea', placeholder: '请输入描述', rows: 3 },
  ]

  // --- DictItem CRUD ---
  const openAddItem = () => {
    if (!selectedDict) return
    setItemFormTitle('新增字典项')
    setItemFormValues({ dictCode: selectedDict.code, sort: 0, status: 1 })
    setItemFormOpen(true)
  }

  const openEditItem = (item: DictItem) => {
    setItemFormTitle('编辑字典项')
    setItemFormValues({
      id: item.id,
      label: item.label,
      value: item.value,
      dictCode: item.dictCode,
      sort: item.sort,
      status: item.status,
      color: item.color,
      cssClass: item.cssClass,
      description: item.description,
    })
    setItemFormOpen(true)
  }

  const handleItemSubmit = async (values: Record<string, unknown>) => {
    setItemFormLoading(true)
    try {
      const payload = { ...values, status: Number(values.status), sort: Number(values.sort) }
      if (values.id) {
        await updateDictItem(values.id as number, payload as Partial<DictItem>)
        toast.success('更新成功')
      } else {
        await addDictItem(payload as Partial<DictItem>)
        toast.success('新增成功')
      }
      setItemFormOpen(false)
      fetchItems()
    } catch {
      // handled
    } finally {
      setItemFormLoading(false)
    }
  }

  const handleItemDelete = async () => {
    if (!itemDeleteTarget) return
    try {
      await deleteDictItem([String(itemDeleteTarget.id)])
      toast.success('删除成功')
      setItemDeleteOpen(false)
      setItemDeleteTarget(null)
      fetchItems()
    } catch {
      // handled
    }
  }

  const itemFields: FormField[] = [
    { name: 'dictCode', label: '字典编码', type: 'input', disabled: true },
    { name: 'label', label: '标签', type: 'input', placeholder: '请输入标签', required: true },
    { name: 'value', label: '值', type: 'input', placeholder: '请输入值', required: true },
    { name: 'sort', label: '排序', type: 'number', placeholder: '请输入排序号' },
    { name: 'status', label: '状态', type: 'switch' },
    { name: 'color', label: '颜色', type: 'input', placeholder: '请输入颜色值' },
    { name: 'cssClass', label: 'CSS类名', type: 'input', placeholder: '请输入CSS类名' },
    { name: 'description', label: '描述', type: 'textarea', placeholder: '请输入描述', rows: 2, span: 2 },
  ]

  const dictTotalPages = Math.ceil(dictTotal / pageSize)
  const itemTotalPages = Math.ceil(itemTotal / pageSize)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">字典管理</h1>
        <p className="text-sm text-muted-foreground mt-1">数据字典配置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4">
        {/* Left: Dict list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Book className="h-4 w-4" />
              字典列表
            </CardTitle>
            {has('system:dict:create') && (
              <Button size="sm" onClick={openAddDict}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                新增
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>编码</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="w-[100px] text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dictLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : dictList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">暂无数据</TableCell>
                    </TableRow>
                  ) : (
                    dictList.map((dict) => (
                      <TableRow
                        key={dict.id}
                        className={`cursor-pointer ${selectedDict?.id === dict.id ? 'bg-muted/50' : ''}`}
                        onClick={() => setSelectedDict(dict)}
                      >
                        <TableCell className="font-medium">{dict.name}</TableCell>
                        <TableCell className="font-mono text-xs">{dict.code}</TableCell>
                        <TableCell>
                          <Badge variant={dict.status === 1 ? 'default' : 'destructive'}>
                            {dict.status === 1 ? '启用' : '禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {has('system:dict:update') && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDict(dict)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {has('system:dict:delete') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => { setDictDeleteTarget(dict); setDictDeleteOpen(true) }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {dictTotalPages > 1 && (
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>共 {dictTotal} 条</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    disabled={dictPage <= 1}
                    onClick={() => setDictPage((p) => p - 1)}
                  >
                    上一页
                  </Button>
                  <span className="px-2">{dictPage} / {dictTotalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    disabled={dictPage >= dictTotalPages}
                    onClick={() => setDictPage((p) => p + 1)}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Dict item list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {selectedDict ? `${selectedDict.name} - 字典项` : '字典项'}
            </CardTitle>
            {selectedDict && has('system:dict:create') && (
              <Button size="sm" onClick={openAddItem}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                新增
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!selectedDict ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                请先选择左侧字典
              </div>
            ) : (
              <>
                <div className="rounded border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>标签</TableHead>
                        <TableHead>值</TableHead>
                        <TableHead>排序</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>颜色</TableHead>
                        <TableHead className="w-[100px] text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : itemList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">暂无数据</TableCell>
                        </TableRow>
                      ) : (
                        itemList.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.label}</TableCell>
                            <TableCell className="font-mono text-xs">{item.value}</TableCell>
                            <TableCell>{item.sort}</TableCell>
                            <TableCell>
                              <Badge variant={item.status === 1 ? 'default' : 'destructive'}>
                                {item.status === 1 ? '启用' : '禁用'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.color ? (
                                <div className="flex items-center gap-2">
                                  <span
                                    className="inline-block h-4 w-4 rounded border"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span className="text-xs text-muted-foreground">{item.color}</span>
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {has('system:dict:update') && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditItem(item)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {has('system:dict:delete') && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => { setItemDeleteTarget(item); setItemDeleteOpen(true) }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {itemTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>共 {itemTotal} 条</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2"
                        disabled={itemPage <= 1}
                        onClick={() => setItemPage((p) => p - 1)}
                      >
                        上一页
                      </Button>
                      <span className="px-2">{itemPage} / {itemTotalPages}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2"
                        disabled={itemPage >= itemTotalPages}
                        onClick={() => setItemPage((p) => p + 1)}
                      >
                        下一页
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dict form */}
      <CrudForm
        open={dictFormOpen}
        onOpenChange={setDictFormOpen}
        title={dictFormTitle}
        fields={dictFields}
        values={dictFormValues}
        loading={dictFormLoading}
        onSubmit={handleDictSubmit}
      />

      {/* Dict item form */}
      <CrudForm
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        title={itemFormTitle}
        fields={itemFields}
        values={itemFormValues}
        loading={itemFormLoading}
        onSubmit={handleItemSubmit}
        width="max-w-2xl"
      />

      {/* Dict delete confirm */}
      <DeleteConfirm
        open={dictDeleteOpen}
        onOpenChange={setDictDeleteOpen}
        onConfirm={handleDictDelete}
      />

      {/* Dict item delete confirm */}
      <DeleteConfirm
        open={itemDeleteOpen}
        onOpenChange={setItemDeleteOpen}
        onConfirm={handleItemDelete}
      />
    </div>
  )
}
