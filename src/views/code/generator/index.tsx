import { useState, useCallback, useMemo, useEffect } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Eye,
  Download,
  Search,
  RotateCcw,
  Settings,
  Copy,
  FileCode,
  File,
  FolderOpen,
  Folder,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTable } from '@/components/data-table'
import { useCrud } from '@/hooks/use-crud'
import {
  getTablePage,
  previewCode,
  generateCode,
  batchGenerateCode,
  type TableInfo,
} from '@/apis/code/generator'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FieldConfig {
  fieldName: string
  fieldType: string
  fieldComment: string
  showInList: boolean
  showInForm: boolean
  showInQuery: boolean
  formType: 'input' | 'text' | 'select' | 'date'
  queryType: '=' | 'like' | 'between'
  dictCode: string
}

interface GenConfig {
  author: string
  moduleName: string
  packageName: string
  tablePrefix: string
  overwrite: boolean
}

// ---------------------------------------------------------------------------
// Helpers – build a simple file tree from the preview Record<string,string>
// ---------------------------------------------------------------------------

interface FileNode {
  name: string
  path: string
  children?: FileNode[]
  content?: string
}

function buildFileTree(files: Record<string, string>): FileNode[] {
  const roots: FileNode[] = []
  const dirMap = new Map<string, FileNode>()

  const sorted = Object.keys(files).sort()

  for (const fullPath of sorted) {
    const segments = fullPath.split('/')
    let currentChildren = roots
    let accumulated = ''

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      accumulated = accumulated ? `${accumulated}/${segment}` : segment
      const isFile = i === segments.length - 1

      if (isFile) {
        currentChildren.push({
          name: segment,
          path: fullPath,
          content: files[fullPath],
        })
      } else {
        let dir = currentChildren.find((n) => n.name === segment && !n.content)
        if (!dir) {
          dir = { name: segment, path: accumulated, children: [] }
          currentChildren.push(dir)
        }
        if (!dir.children) dir.children = []
        currentChildren = dir.children
      }
    }
  }

  return roots
}

function getFileIcon(name: string) {
  if (name.endsWith('.java') || name.endsWith('.xml') || name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js') || name.endsWith('.vue')) {
    return <FileCode className="h-4 w-4 shrink-0 text-blue-500" />
  }
  return <File className="h-4 w-4 shrink-0 text-muted-foreground" />
}

// ---------------------------------------------------------------------------
// Mock field config (since API does not expose column-level metadata)
// ---------------------------------------------------------------------------

function mockFieldConfigs(): FieldConfig[] {
  return [
    { fieldName: 'id', fieldType: 'Long', fieldComment: '主键ID', showInList: false, showInForm: false, showInQuery: false, formType: 'input', queryType: '=', dictCode: '' },
    { fieldName: 'name', fieldType: 'String', fieldComment: '名称', showInList: true, showInForm: true, showInQuery: true, formType: 'input', queryType: 'like', dictCode: '' },
    { fieldName: 'status', fieldType: 'Integer', fieldComment: '状态', showInList: true, showInForm: true, showInQuery: true, formType: 'select', queryType: '=', dictCode: 'sys_normal_disable' },
    { fieldName: 'create_by', fieldType: 'String', fieldComment: '创建者', showInList: true, showInForm: false, showInQuery: false, formType: 'input', queryType: '=', dictCode: '' },
    { fieldName: 'create_time', fieldType: 'Date', fieldComment: '创建时间', showInList: true, showInForm: false, showInQuery: true, formType: 'date', queryType: 'between', dictCode: '' },
    { fieldName: 'update_by', fieldType: 'String', fieldComment: '更新者', showInList: false, showInForm: false, showInQuery: false, formType: 'input', queryType: '=', dictCode: '' },
    { fieldName: 'update_time', fieldType: 'Date', fieldComment: '更新时间', showInList: false, showInForm: false, showInQuery: false, formType: 'date', queryType: '=', dictCode: '' },
    { fieldName: 'remark', fieldType: 'String', fieldComment: '备注', showInList: true, showInForm: true, showInQuery: false, formType: 'text', queryType: 'like', dictCode: '' },
  ]
}

// ---------------------------------------------------------------------------
// File tree (recursive) component used inside preview modal
// ---------------------------------------------------------------------------

function FileTreeView({
  nodes,
  activeFile,
  onSelect,
  depth = 0,
}: {
  nodes: FileNode[]
  activeFile: string
  onSelect: (path: string) => void
  depth?: number
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // auto-expand all directories initially
    const set = new Set<string>()
    const walk = (items: FileNode[]) => {
      for (const n of items) {
        if (n.children) {
          set.add(n.path)
          walk(n.children)
        }
      }
    }
    walk(nodes)
    return set
  })

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  return (
    <div className={depth > 0 ? 'ml-3 border-l border-border pl-1' : ''}>
      {nodes.map((node) => {
        const isDir = !!node.children
        const isOpen = expanded.has(node.path)
        return (
          <div key={node.path}>
            <button
              type="button"
              className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-accent ${
                !isDir && activeFile === node.path ? 'bg-accent font-medium text-accent-foreground' : 'text-foreground'
              }`}
              style={{ paddingLeft: `${depth * 4}px` }}
              onClick={() => {
                if (isDir) toggle(node.path)
                else onSelect(node.path)
              }}
            >
              {isDir ? (
                isOpen ? (
                  <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
                ) : (
                  <Folder className="h-4 w-4 shrink-0 text-amber-500" />
                )
              ) : (
                getFileIcon(node.name)
              )}
              <span className="truncate">{node.name}</span>
            </button>
            {isDir && isOpen && node.children && (
              <FileTreeView
                nodes={node.children}
                activeFile={activeFile}
                onSelect={onSelect}
                depth={depth + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// GenConfigDrawer
// ---------------------------------------------------------------------------

function GenConfigDrawer({
  open,
  onOpenChange,
  tableName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableName: string
}) {
  const [config, setConfig] = useState<GenConfig>({
    author: 'admin',
    moduleName: 'system',
    packageName: 'com.continew',
    tablePrefix: 'sys_',
    overwrite: false,
  })
  const [fields, setFields] = useState<FieldConfig[]>(mockFieldConfigs)
  const [saving, setSaving] = useState(false)

  const handleConfigChange = useCallback(
    <K extends keyof GenConfig>(key: K, value: GenConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const handleFieldChange = useCallback(
    <K extends keyof FieldConfig>(index: number, key: K, value: FieldConfig[K]) => {
      setFields((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [key]: value }
        return next
      })
    },
    []
  )

  const handleSaveConfig = useCallback(() => {
    setSaving(true)
    // Simulate save
    setTimeout(() => {
      setSaving(false)
      toast.success('配置保存成功')
    }, 500)
  }, [])

  const handleSaveFields = useCallback(() => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('字段配置保存成功')
    }, 500)
  }, [])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>生成配置</SheetTitle>
          <SheetDescription>
            配置表 <Badge variant="secondary">{tableName}</Badge> 的代码生成参数
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden px-4">
          <Tabs defaultValue="gen" className="flex h-full flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="gen" className="flex-1">
                生成配置
              </TabsTrigger>
              <TabsTrigger value="field" className="flex-1">
                字段配置
              </TabsTrigger>
            </TabsList>

            {/* ---- 生成配置 tab ---- */}
            <TabsContent value="gen" className="flex-1 overflow-auto">
              <div className="space-y-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="author">作者名称</Label>
                  <Input
                    id="author"
                    value={config.author}
                    onChange={(e) => handleConfigChange('author', e.target.value)}
                    placeholder="请输入作者名称"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="moduleName">模块名称</Label>
                  <Input
                    id="moduleName"
                    value={config.moduleName}
                    onChange={(e) => handleConfigChange('moduleName', e.target.value)}
                    placeholder="请输入模块名称"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="packageName">包名称</Label>
                  <Input
                    id="packageName"
                    value={config.packageName}
                    onChange={(e) => handleConfigChange('packageName', e.target.value)}
                    placeholder="请输入包名称"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tablePrefix">表前缀</Label>
                  <Input
                    id="tablePrefix"
                    value={config.tablePrefix}
                    onChange={(e) => handleConfigChange('tablePrefix', e.target.value)}
                    placeholder="请输入表前缀"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label>是否覆盖</Label>
                    <p className="text-xs text-muted-foreground">
                      开启后生成代码时将覆盖已有文件
                    </p>
                  </div>
                  <Switch
                    checked={config.overwrite}
                    onCheckedChange={(v) => handleConfigChange('overwrite', v)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* ---- 字段配置 tab ---- */}
            <TabsContent value="field" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-260px)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">字段名</TableHead>
                      <TableHead className="whitespace-nowrap">字段类型</TableHead>
                      <TableHead className="whitespace-nowrap">字段注释</TableHead>
                      <TableHead className="whitespace-nowrap text-center">列表</TableHead>
                      <TableHead className="whitespace-nowrap text-center">表单</TableHead>
                      <TableHead className="whitespace-nowrap text-center">查询</TableHead>
                      <TableHead className="whitespace-nowrap">表单类型</TableHead>
                      <TableHead className="whitespace-nowrap">查询方式</TableHead>
                      <TableHead className="whitespace-nowrap">字典编码</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((f, idx) => (
                      <TableRow key={f.fieldName}>
                        <TableCell className="font-mono text-xs">{f.fieldName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {f.fieldType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-7 text-xs"
                            value={f.fieldComment}
                            onChange={(e) => handleFieldChange(idx, 'fieldComment', e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={f.showInList}
                            onCheckedChange={(v) => handleFieldChange(idx, 'showInList', !!v)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={f.showInForm}
                            onCheckedChange={(v) => handleFieldChange(idx, 'showInForm', !!v)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={f.showInQuery}
                            onCheckedChange={(v) => handleFieldChange(idx, 'showInQuery', !!v)}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={f.formType}
                            onValueChange={(v) =>
                              handleFieldChange(idx, 'formType', v as FieldConfig['formType'])
                            }
                          >
                            <SelectTrigger className="h-7 w-20 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="input">input</SelectItem>
                              <SelectItem value="text">text</SelectItem>
                              <SelectItem value="select">select</SelectItem>
                              <SelectItem value="date">date</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={f.queryType}
                            onValueChange={(v) =>
                              handleFieldChange(idx, 'queryType', v as FieldConfig['queryType'])
                            }
                          >
                            <SelectTrigger className="h-7 w-20 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="=">=</SelectItem>
                              <SelectItem value="like">like</SelectItem>
                              <SelectItem value="between">between</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-7 text-xs"
                            value={f.dictCode}
                            onChange={(e) => handleFieldChange(idx, 'dictCode', e.target.value)}
                            placeholder="字典编码"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSaveConfig} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// GenPreviewModal
// ---------------------------------------------------------------------------

function GenPreviewModal({
  open,
  onOpenChange,
  tableName,
  previewData,
  loading,
  onGenerate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableName: string
  previewData: Record<string, string>
  loading: boolean
  onGenerate: () => void
}) {
  const [activeFile, setActiveFile] = useState('')
  const [copied, setCopied] = useState(false)

  const fileTree = useMemo(() => buildFileTree(previewData), [previewData])
  const allFiles = useMemo(() => Object.keys(previewData).sort(), [previewData])

  // Reset active file when data changes
  useEffect(() => {
    if (allFiles.length > 0 && !allFiles.includes(activeFile)) {
      setActiveFile(allFiles[0])
    }
  }, [allFiles, activeFile])

  const currentContent = previewData[activeFile] || ''

  const handleCopy = useCallback(async () => {
    if (!currentContent) return
    try {
      await navigator.clipboard.writeText(currentContent)
      setCopied(true)
      toast.success('已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }, [currentContent])

  const handleDownloadFile = useCallback(() => {
    if (!currentContent || !activeFile) return
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = activeFile.split('/').pop() || 'file.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('文件下载成功')
  }, [currentContent, activeFile])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-full max-w-[95vw] flex-col gap-0 p-0" showCloseButton={false}>
        {/* Top toolbar */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            <DialogTitle className="text-base">代码预览</DialogTitle>
            <Badge variant="secondary" className="text-xs">
              {tableName}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {allFiles.length} 个文件
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? '已复制' : '复制'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadFile}>
              <Download className="h-4 w-4 mr-1" />
              下载当前文件
            </Button>
            <Button size="sm" onClick={onGenerate}>
              <Download className="h-4 w-4 mr-1" />
              生成全部
            </Button>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)}>
              <span className="sr-only">关闭</span>
              &times;
            </Button>
          </div>
        </div>

        {/* Body: file tree + code */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Left panel – file tree */}
            <div className="w-64 shrink-0 border-r">
              <ScrollArea className="h-full">
                <div className="p-2">
                  <FileTreeView
                    nodes={fileTree}
                    activeFile={activeFile}
                    onSelect={setActiveFile}
                  />
                </div>
              </ScrollArea>
            </div>

            {/* Right panel – code */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* File tabs */}
              {allFiles.length > 1 && (
                <div className="flex items-center gap-1 border-b px-2 py-1 overflow-x-auto">
                  {allFiles.map((f) => {
                    const name = f.split('/').pop() || f
                    return (
                      <button
                        key={f}
                        type="button"
                        className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs transition-colors ${
                          activeFile === f
                            ? 'bg-accent font-medium text-accent-foreground'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        }`}
                        onClick={() => setActiveFile(f)}
                      >
                        {getFileIcon(name)}
                        {name}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Code content */}
              <ScrollArea className="flex-1">
                <div className="relative">
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-muted/50 px-4 py-1.5">
                    <span className="font-mono text-xs text-muted-foreground">
                      {activeFile}
                    </span>
                  </div>
                  <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
                    <code className="font-mono text-foreground">{currentContent}</code>
                  </pre>
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function GeneratorPage() {
  // Search state
  const [tableName, setTableName] = useState('')
  const [tableComment, setTableComment] = useState('')

  // Selection state
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<Record<string, string>>({})
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewTable, setPreviewTable] = useState('')

  // Config state
  const [configOpen, setConfigOpen] = useState(false)
  const [configTable, setConfigTable] = useState('')

  // Data fetching
  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const query: Record<string, unknown> = { ...params }
      if (tableName) query.tableName = tableName
      if (tableComment) query.tableComment = tableComment
      return getTablePage(query as any)
    },
    [tableName, tableComment]
  )

  const {
    data,
    total,
    loading,
    query,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
  } = useCrud<TableInfo, any>({ listApi })

  // Derive selected table names from selected row indices
  const selectedTableNames = useMemo(() => {
    return Array.from(selectedRows)
      .map((idx) => data[idx]?.tableName)
      .filter(Boolean) as string[]
  }, [selectedRows, data])

  // ---- Actions ----

  const handlePreview = useCallback(
    async (row: TableInfo) => {
      setPreviewTable(row.tableName)
      setPreviewLoading(true)
      setPreviewOpen(true)
      setPreviewData({})
      try {
        const res = await previewCode(row.tableName)
        setPreviewData(res.data)
      } catch {
        // handled by interceptor
      } finally {
        setPreviewLoading(false)
      }
    },
    []
  )

  const handleGenerate = useCallback(async (row: TableInfo) => {
    try {
      const blob = await generateCode(row.tableName)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${row.tableName}.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('生成成功')
    } catch {
      // handled by interceptor
    }
  }, [])

  const handleBatchGenerate = useCallback(async () => {
    if (selectedTableNames.length === 0) {
      toast.warning('请先选择要生成的表')
      return
    }
    try {
      const blob = await batchGenerateCode(selectedTableNames)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `codegen-${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`已生成 ${selectedTableNames.length} 个表的代码`)
      setSelectedRows(new Set())
    } catch {
      // handled by interceptor
    }
  }, [selectedTableNames])

  const handleGenerateAll = useCallback(async () => {
    if (data.length === 0) {
      toast.warning('暂无数据')
      return
    }
    const allNames = data.map((r) => r.tableName)
    try {
      const blob = await batchGenerateCode(allNames)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `codegen-all-${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`已生成 ${allNames.length} 个表的代码`)
    } catch {
      // handled by interceptor
    }
  }, [data])

  const handleOpenConfig = useCallback((row: TableInfo) => {
    setConfigTable(row.tableName)
    setConfigOpen(true)
  }, [])

  const handleSearchClick = () =>
    handleSearch({ tableName, tableComment } as any)

  const handleResetClick = () => {
    setTableName('')
    setTableComment('')
    handleReset()
  }

  // Toggle single row selection
  const toggleRow = useCallback(
    (index: number) => {
      setSelectedRows((prev) => {
        const next = new Set(prev)
        if (next.has(index)) next.delete(index)
        else next.add(index)
        return next
      })
    },
    []
  )

  // Toggle all rows on current page
  const toggleAll = useCallback(() => {
    setSelectedRows((prev) => {
      const allSelected = data.every((_, i) => prev.has(i))
      if (allSelected) return new Set()
      return new Set(data.map((_, i) => i))
    })
  }, [data])

  // ---- Columns ----

  const columns: ColumnDef<TableInfo, any>[] = useMemo(
    () => [
      {
        id: 'select',
        header: () => {
          const allSelected = data.length > 0 && data.every((_, i) => selectedRows.has(i))
          const someSelected = data.some((_, i) => selectedRows.has(i))
          return (
            <Checkbox
              checked={allSelected || (someSelected && 'indeterminate')}
              onCheckedChange={() => toggleAll()}
              aria-label="全选"
            />
          )
        },
        cell: ({ row }) => {
          const index = row.index
          return (
            <Checkbox
              checked={selectedRows.has(index)}
              onCheckedChange={() => toggleRow(index)}
              aria-label={`选择 ${row.original.tableName}`}
            />
          )
        },
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: 'tableName',
        header: '表名',
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.tableName}</span>
        ),
      },
      {
        accessorKey: 'tableComment',
        header: '表注释',
        cell: ({ row }) => row.original.tableComment || '-',
      },
      {
        accessorKey: 'engine',
        header: '引擎',
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.engine}
          </Badge>
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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handlePreview(row.original)
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              预览
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenConfig(row.original)
              }}
            >
              <Settings className="h-4 w-4 mr-1" />
              配置
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleGenerate(row.original)
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              生成
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [data, selectedRows, toggleAll, toggleRow, handlePreview, handleOpenConfig, handleGenerate]
  )

  // ---- Render ----

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-medium text-foreground">代码生成</h1>
        <p className="text-sm text-muted-foreground mt-1">
          根据数据库表结构自动生成前后端代码
        </p>
      </div>

      {/* Search form */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">表名</Label>
          <Input
            placeholder="请输入表名"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="h-8 w-48"
            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">表注释</Label>
          <Input
            placeholder="请输入表注释"
            value={tableComment}
            onChange={(e) => setTableComment(e.target.value)}
            className="h-8 w-48"
            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
          />
        </div>
        <Button size="sm" onClick={handleSearchClick}>
          <Search className="h-4 w-4 mr-1" />
          搜索
        </Button>
        <Button size="sm" variant="outline" onClick={handleResetClick}>
          <RotateCcw className="h-4 w-4 mr-1" />
          重置
        </Button>

        {/* Toolbar actions */}
        <div className="ml-auto flex items-center gap-2">
          {selectedRows.size > 0 && (
            <Button size="sm" variant="secondary" onClick={handleBatchGenerate}>
              <Download className="h-4 w-4 mr-1" />
              批量生成 ({selectedRows.size})
            </Button>
          )}
          <Button size="sm" onClick={handleGenerateAll}>
            <Download className="h-4 w-4 mr-1" />
            生成全部
          </Button>
        </div>
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={query.page || 1}
        size={query.size || 10}
        loading={loading}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
      />

      {/* Preview modal */}
      <GenPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        tableName={previewTable}
        previewData={previewData}
        loading={previewLoading}
        onGenerate={() => {
          if (previewTable) {
            const row = data.find((r) => r.tableName === previewTable)
            if (row) handleGenerate(row)
          }
        }}
      />

      {/* Config drawer */}
      <GenConfigDrawer
        open={configOpen}
        onOpenChange={setConfigOpen}
        tableName={configTable}
      />
    </div>
  )
}
