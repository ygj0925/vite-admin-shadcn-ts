import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import hljs from 'highlight.js/lib/core'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/github-dark.css'
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
  RefreshCw,
  Trash2,
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
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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
import { DeleteConfirm } from '@/components/delete-confirm'
import { useCrud } from '@/hooks/use-crud'
import { usePermission } from '@/hooks/use-permission'
import {
  listGenConfig,
  getGenConfig,
  listFieldConfig,
  listFieldConfigDict,
  saveGenConfig,
  genPreview,
  generateCode,
  downloadCode,
  type GenConfigResp,
  type FieldConfigResp,
  type LabelValue,
} from '@/apis/code/generator'
import { toast } from 'sonner'

hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('json', json)

const FIELD_TYPE_OPTIONS = [
  'String', 'Integer', 'Long', 'Float', 'Double', 'Boolean',
  'BigDecimal', 'LocalDate', 'LocalTime', 'LocalDateTime',
]

const FORM_TYPE_OPTIONS = [
  { label: 'input', value: 'input' },
  { label: 'text', value: 'text' },
  { label: 'select', value: 'select' },
  { label: 'date', value: 'date' },
]

const QUERY_TYPE_OPTIONS = [
  { label: '=', value: '=' },
  { label: 'like', value: 'like' },
  { label: 'between', value: 'between' },
]

// ---------------------------------------------------------------------------
// File tree helpers
// ---------------------------------------------------------------------------

interface FileNode {
  name: string
  path: string
  children?: FileNode[]
  content?: string
}

function buildFileTree(files: Record<string, string>): FileNode[] {
  const roots: FileNode[] = []
  const sorted = Object.keys(files).sort()

  for (const fullPath of sorted) {
    const segments = fullPath.replace(/\\/g, '/').split('/')
    let currentChildren = roots
    let accumulated = ''

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      accumulated = accumulated ? `${accumulated}/${segment}` : segment
      const isFile = i === segments.length - 1

      if (isFile) {
        currentChildren.push({ name: segment, path: fullPath, content: files[fullPath] })
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
  if (name.endsWith('.java')) return <FileCode className="h-4 w-4 shrink-0 text-orange-500" />
  if (name.endsWith('.vue')) return <FileCode className="h-4 w-4 shrink-0 text-green-500" />
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return <FileCode className="h-4 w-4 shrink-0 text-blue-500" />
  if (name.endsWith('.js')) return <FileCode className="h-4 w-4 shrink-0 text-yellow-500" />
  if (name.endsWith('.xml') || name.endsWith('.sql')) return <File className="h-4 w-4 shrink-0 text-purple-500" />
  if (name.endsWith('.json')) return <File className="h-4 w-4 shrink-0 text-muted-foreground" />
  return <File className="h-4 w-4 shrink-0 text-muted-foreground" />
}

function getHighlightLang(name: string): string {
  if (name.endsWith('.java')) return 'java'
  if (name.endsWith('.vue') || name.endsWith('.html')) return 'xml'
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'typescript'
  if (name.endsWith('.js')) return 'javascript'
  if (name.endsWith('.xml')) return 'xml'
  if (name.endsWith('.sql')) return 'sql'
  if (name.endsWith('.json')) return 'json'
  return 'java'
}

// ---------------------------------------------------------------------------
// FileTreeView (recursive)
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
    const set = new Set<string>()
    const walk = (items: FileNode[]) => {
      for (const n of items) {
        if (n.children) { set.add(n.path); walk(n.children) }
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
              onClick={() => { if (isDir) toggle(node.path); else onSelect(node.path) }}
            >
              {isDir ? (
                isOpen ? <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" /> : <Folder className="h-4 w-4 shrink-0 text-amber-500" />
              ) : (
                getFileIcon(node.name)
              )}
              <span className="truncate">{node.name}</span>
            </button>
            {isDir && isOpen && node.children && (
              <FileTreeView nodes={node.children} activeFile={activeFile} onSelect={onSelect} depth={depth + 1} />
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
  const [config, setConfig] = useState<Partial<GenConfigResp>>({})
  const [fields, setFields] = useState<FieldConfigResp[]>([])
  const [dictOptions, setDictOptions] = useState<LabelValue[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncOpen, setSyncOpen] = useState(false)

  useEffect(() => {
    if (!open || !tableName) return
    setLoading(true)
    Promise.all([
      getGenConfig(tableName),
      listFieldConfig(tableName, false),
      listFieldConfigDict(),
    ]).then(([configRes, fieldRes, dictRes]) => {
      setConfig(configRes.data || {})
      setFields(fieldRes.data || [])
      setDictOptions(dictRes.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [open, tableName])

  const handleConfigChange = useCallback(<K extends keyof GenConfigResp>(key: K, value: GenConfigResp[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleFieldChange = useCallback(<K extends keyof FieldConfigResp>(index: number, key: K, value: FieldConfigResp[K]) => {
    setFields((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }, [])

  const handleSync = useCallback(async () => {
    if (!tableName) return
    try {
      const res = await listFieldConfig(tableName, true)
      setFields(res.data || [])
      toast.success('同步成功')
    } catch {
      // handled by interceptor
    }
    setSyncOpen(false)
  }, [tableName])

  const handleSave = useCallback(async () => {
    if (!config.author || !config.businessName || !config.moduleName || !config.packageName) {
      toast.warning('请填写必填项')
      return
    }
    setSaving(true)
    try {
      await saveGenConfig(tableName, { genConfig: config as GenConfigResp, fieldConfigs: fields })
      toast.success('保存成功')
      onOpenChange(false)
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false)
    }
  }, [tableName, config, fields, onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>生成配置</SheetTitle>
          <SheetDescription>配置表 <Badge variant="secondary">{tableName}</Badge> 的代码生成参数</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden px-4">
            <Tabs defaultValue="gen" className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="gen">生成配置</TabsTrigger>
                  <TabsTrigger value="field">字段配置</TabsTrigger>
                </TabsList>
                <DeleteConfirm open={syncOpen} onOpenChange={setSyncOpen} onConfirm={handleSync} title="确认同步" description="同步将从数据库重新读取字段配置，当前未保存的修改将丢失。" />
                <Button variant="outline" size="sm" onClick={() => setSyncOpen(true)}>
                  <RefreshCw className="h-4 w-4 mr-1" /> 同步
                </Button>
              </div>

              {/* ---- 生成配置 tab ---- */}
              <TabsContent value="gen" className="flex-1 overflow-auto">
                <div className="space-y-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="author">作者名称 <span className="text-destructive">*</span></Label>
                    <Input id="author" value={config.author || ''} onChange={(e) => handleConfigChange('author', e.target.value)} placeholder="请输入作者名称" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="businessName">业务名称 <span className="text-destructive">*</span></Label>
                    <Input id="businessName" value={config.businessName || ''} onChange={(e) => handleConfigChange('businessName', e.target.value)} placeholder="例如: user" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="moduleName">模块名称 <span className="text-destructive">*</span></Label>
                    <Input id="moduleName" value={config.moduleName || ''} onChange={(e) => handleConfigChange('moduleName', e.target.value)} placeholder="例如: continew-system" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="packageName">包名称 <span className="text-destructive">*</span></Label>
                    <Input id="packageName" value={config.packageName || ''} onChange={(e) => handleConfigChange('packageName', e.target.value)} placeholder="例如: top.continew.admin.system" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tablePrefix">表前缀</Label>
                    <Input id="tablePrefix" value={config.tablePrefix || ''} onChange={(e) => handleConfigChange('tablePrefix', e.target.value)} placeholder="例如: sys_" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label>是否覆盖</Label>
                      <p className="text-xs text-muted-foreground">开启后生成代码时将覆盖已有文件</p>
                    </div>
                    <Switch checked={config.isOverride || false} onCheckedChange={(v) => handleConfigChange('isOverride', v)} />
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
                        <TableHead className="whitespace-nowrap">注释</TableHead>
                        <TableHead className="whitespace-nowrap text-center">列表</TableHead>
                        <TableHead className="whitespace-nowrap text-center">表单</TableHead>
                        <TableHead className="whitespace-nowrap text-center">必填</TableHead>
                        <TableHead className="whitespace-nowrap text-center">查询</TableHead>
                        <TableHead className="whitespace-nowrap">表单类型</TableHead>
                        <TableHead className="whitespace-nowrap">查询方式</TableHead>
                        <TableHead className="whitespace-nowrap">字典编码</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((f, idx) => (
                        <TableRow key={f.columnName}>
                          <TableCell>
                            <Input className="h-7 text-xs font-mono" value={f.fieldName} onChange={(e) => handleFieldChange(idx, 'fieldName', e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Select value={f.fieldType} onValueChange={(v) => handleFieldChange(idx, 'fieldType', v)}>
                              <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {FIELD_TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input className="h-7 text-xs" value={f.comment} onChange={(e) => handleFieldChange(idx, 'comment', e.target.value)} />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked={f.showInList} onCheckedChange={(v) => handleFieldChange(idx, 'showInList', !!v)} />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked={f.showInForm} onCheckedChange={(v) => handleFieldChange(idx, 'showInForm', !!v)} />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked={f.isRequired} disabled={!f.showInForm} onCheckedChange={(v) => handleFieldChange(idx, 'isRequired', !!v)} />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked={f.showInQuery} onCheckedChange={(v) => handleFieldChange(idx, 'showInQuery', !!v)} />
                          </TableCell>
                          <TableCell>
                            {f.showInForm || f.showInQuery ? (
                              <Select value={f.formType} onValueChange={(v) => handleFieldChange(idx, 'formType', v)}>
                                <SelectTrigger className="h-7 w-20 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {FORM_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-xs text-muted-foreground">无需配置</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {f.showInQuery ? (
                              <Select value={f.queryType} onValueChange={(v) => handleFieldChange(idx, 'queryType', v)}>
                                <SelectTrigger className="h-7 w-20 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {QUERY_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-xs text-muted-foreground">无需配置</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select value={f.dictCode || '__none__'} onValueChange={(v) => handleFieldChange(idx, 'dictCode', v === '__none__' ? '' : v)}>
                              <SelectTrigger className="h-7 w-32 text-xs"><SelectValue placeholder="无" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">无</SelectItem>
                                {dictOptions.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave} disabled={saving || loading}>{saving ? '保存中...' : '保存'}</Button>
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
  onDownload,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableName: string
  previewData: Record<string, string>
  loading: boolean
  onGenerate: () => void
  onDownload: () => void
}) {
  const [activeFile, setActiveFile] = useState('')
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  const fileTree = useMemo(() => buildFileTree(previewData), [previewData])
  const allFiles = useMemo(() => Object.keys(previewData).sort(), [previewData])

  useEffect(() => {
    if (allFiles.length > 0 && !allFiles.includes(activeFile)) {
      setActiveFile(allFiles[0])
    }
  }, [allFiles, activeFile])

  const currentContent = previewData[activeFile] || ''

  useEffect(() => {
    if (codeRef.current && currentContent) {
      codeRef.current.removeAttribute('data-highlighted')
      codeRef.current.textContent = currentContent
      codeRef.current.className = `language-${getHighlightLang(activeFile)}`
      hljs.highlightElement(codeRef.current)
    }
  }, [currentContent, activeFile])

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-full max-w-[95vw] flex-col gap-0 p-0" showCloseButton={false}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            <DialogTitle className="text-base">代码预览</DialogTitle>
            <Badge variant="secondary" className="text-xs">{tableName}</Badge>
            <span className="text-xs text-muted-foreground">{allFiles.length} 个文件</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? '已复制' : '复制'}
            </Button>
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-1" /> 下载源码
            </Button>
            <Button size="sm" onClick={onGenerate}>
              <Download className="h-4 w-4 mr-1" /> 生成源码
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 shrink-0 border-r">
              <ScrollArea className="h-full">
                <div className="p-2">
                  <FileTreeView nodes={fileTree} activeFile={activeFile} onSelect={setActiveFile} />
                </div>
              </ScrollArea>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
              {allFiles.length > 1 && (
                <div className="flex items-center gap-1 border-b px-2 py-1 overflow-x-auto">
                  {allFiles.map((f) => {
                    const name = f.split('/').pop() || f
                    return (
                      <button
                        key={f}
                        type="button"
                        className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs transition-colors ${
                          activeFile === f ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
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

              <ScrollArea className="flex-1">
                <div className="relative">
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-muted/50 px-4 py-1.5">
                    <span className="font-mono text-xs text-muted-foreground">{activeFile}</span>
                  </div>
                  <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
                    <code ref={codeRef} className="language-java">{currentContent}</code>
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
  const { has } = usePermission()
  const [tableName, setTableName] = useState('')
  const [tableComment, setTableComment] = useState('')
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<Record<string, string>>({})
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewTable, setPreviewTable] = useState('')

  const [configOpen, setConfigOpen] = useState(false)
  const [configTable, setConfigTable] = useState('')

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const query: Record<string, unknown> = { ...params }
      if (tableName) query.tableName = tableName
      if (tableComment) query.tableComment = tableComment
      return listGenConfig(query as any)
    },
    [tableName, tableComment]
  )

  const { data, total, loading, query, fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange } = useCrud<GenConfigResp, any>({ listApi })

  const selectedTableNames = useMemo(() => Array.from(selectedKeys), [selectedKeys])

  // ---- Actions ----

  const handlePreview = useCallback(async (name: string) => {
    setPreviewTable(name)
    setPreviewLoading(true)
    setPreviewOpen(true)
    setPreviewData({})
    try {
      const res = await genPreview([name])
      setPreviewData(res.data || {})
    } catch {
      // handled by interceptor
    } finally {
      setPreviewLoading(false)
    }
  }, [])

  const handleDownload = useCallback(async (names: string[]) => {
    if (names.length === 0) { toast.warning('请先选择表'); return }
    try {
      const blob = await downloadCode(names)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = names.length === 1 ? `${names[0]}.zip` : `codegen-${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('下载成功')
    } catch {
      // handled by interceptor
    }
  }, [])

  const handleGenerate = useCallback(async (names: string[]) => {
    if (names.length === 0) { toast.warning('请先选择表'); return }
    try {
      const blob = await generateCode(names)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = names.length === 1 ? `${names[0]}.zip` : `codegen-${Date.now()}.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('生成成功')
      setSelectedKeys(new Set())
    } catch {
      // handled by interceptor
    }
  }, [])

  const handleOpenConfig = useCallback((name: string) => {
    setConfigTable(name)
    setConfigOpen(true)
  }, [])

  const toggleRow = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelectedKeys((prev) => {
      const pageKeys = data.map((r) => r.tableName)
      const allSelected = pageKeys.every((k) => prev.has(k))
      if (allSelected) {
        const next = new Set(prev)
        pageKeys.forEach((k) => next.delete(k))
        return next
      }
      return new Set([...prev, ...pageKeys])
    })
  }, [data])

  const handleSearchClick = () => handleSearch({ tableName, tableComment } as any)
  const handleResetClick = () => { setTableName(''); setTableComment(''); handleReset() }

  // ---- Columns ----

  const columns: ColumnDef<GenConfigResp, any>[] = useMemo(() => [
    {
      id: 'select',
      header: () => {
        const pageKeys = data.map((r) => r.tableName)
        const allSelected = data.length > 0 && pageKeys.every((k) => selectedKeys.has(k))
        const someSelected = pageKeys.some((k) => selectedKeys.has(k))
        return <Checkbox checked={allSelected || (someSelected && 'indeterminate')} onCheckedChange={() => toggleAll()} aria-label="全选" />
      },
      cell: ({ row }) => (
        <Checkbox checked={selectedKeys.has(row.original.tableName)} onCheckedChange={() => toggleRow(row.original.tableName)} aria-label={`选择 ${row.original.tableName}`} />
      ),
      enableSorting: false, enableHiding: false, size: 40,
    },
    { accessorKey: 'tableName', header: '表名', cell: ({ row }) => <span className="font-mono text-sm">{row.original.tableName}</span> },
    { accessorKey: 'comment', header: '表注释', cell: ({ row }) => row.original.comment || '-' },
    { accessorKey: 'classNamePrefix', header: '类名前缀', cell: ({ row }) => row.original.classNamePrefix || '-' },
    { accessorKey: 'author', header: '作者' },
    { accessorKey: 'moduleName', header: '模块名称' },
    { accessorKey: 'packageName', header: '包名称' },
    { accessorKey: 'createTime', header: '创建时间' },
    { accessorKey: 'updateTime', header: '更新时间' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {has('code:generator:config') && (
            <Button variant="ghost" size="sm" onClick={() => handleOpenConfig(row.original.tableName)}>
              <Settings className="h-4 w-4 mr-1" /> 配置
            </Button>
          )}
          {has('code:generator:preview') && (
            <Button variant="ghost" size="sm" onClick={() => handlePreview(row.original.tableName)}>
              <Eye className="h-4 w-4 mr-1" /> 预览
            </Button>
          )}
          {has('code:generator:generate') && (
            <Button variant="ghost" size="sm" onClick={() => handleGenerate([row.original.tableName])}>
              <Download className="h-4 w-4 mr-1" /> 生成
            </Button>
          )}
        </div>
      ),
      enableSorting: false, enableHiding: false,
    },
  ], [data, selectedKeys, toggleAll, toggleRow, handleOpenConfig, handlePreview, handleGenerate])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">代码生成</h1>
        <p className="text-sm text-muted-foreground mt-1">根据数据库表结构自动生成前后端代码</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">表名</Label>
          <Input placeholder="请输入表名" value={tableName} onChange={(e) => setTableName(e.target.value)} className="h-8 w-48" onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">表注释</Label>
          <Input placeholder="请输入表注释" value={tableComment} onChange={(e) => setTableComment(e.target.value)} className="h-8 w-48" onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()} />
        </div>
        <Button size="sm" onClick={handleSearchClick}><Search className="h-4 w-4 mr-1" />搜索</Button>
        <Button size="sm" variant="outline" onClick={handleResetClick}><RotateCcw className="h-4 w-4 mr-1" />重置</Button>

        <div className="ml-auto flex items-center gap-2">
          {selectedKeys.size > 0 && (
            <>
              <Button size="sm" variant="secondary" onClick={() => handleDownload(selectedTableNames)}>
                <Download className="h-4 w-4 mr-1" /> 下载源码 ({selectedKeys.size})
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleGenerate(selectedTableNames)}>
                <Download className="h-4 w-4 mr-1" /> 批量生成 ({selectedKeys.size})
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedKeys(new Set())}>
                <Trash2 className="h-4 w-4 mr-1" /> 清空选择
              </Button>
            </>
          )}
        </div>
      </div>

      {selectedKeys.size > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
          已选择 <strong>{selectedKeys.size}</strong> 项（支持跨页选择）
        </div>
      )}

      <DataTable columns={columns} data={data} total={total} page={query.page || 1} size={query.size || 10} loading={loading} onPageChange={handlePageChange} onSizeChange={handleSizeChange} />

      <GenPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        tableName={previewTable}
        previewData={previewData}
        loading={previewLoading}
        onGenerate={() => handleGenerate([previewTable])}
        onDownload={() => handleDownload([previewTable])}
      />

      <GenConfigDrawer open={configOpen} onOpenChange={setConfigOpen} tableName={configTable} />
    </div>
  )
}
