import { useState, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Search, RotateCcw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/data-table'
import { useCrud } from '@/hooks/use-crud'
import { getOperationLogPage, exportOperationLog, type LogEntry } from '@/apis/monitor/log'
import { toast } from 'sonner'

export default function OperationLogPage() {
  const [module, setModule] = useState('')
  const [status, setStatus] = useState('')
  const [createUser, setCreateUser] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [current, setCurrent] = useState<LogEntry | null>(null)

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const q: Record<string, unknown> = { ...params }
      if (module) q.module = module
      if (status) q.status = Number(status)
      if (createUser) q.createUser = createUser
      if (startTime) q.startTime = startTime
      if (endTime) q.endTime = endTime
      return getOperationLogPage(q as any)
    },
    [module, status, createUser, startTime, endTime],
  )

  const { data, total, loading, query, handleSearch, handleReset, handlePageChange, handleSizeChange } =
    useCrud<LogEntry, any>({ listApi })

  const columns: ColumnDef<LogEntry, any>[] = [
    { accessorKey: 'module', header: '模块' },
    { accessorKey: 'description', header: '描述' },
    { accessorKey: 'requestMethod', header: '请求方式' },
    { accessorKey: 'requestUrl', header: '请求地址' },
    { accessorKey: 'ip', header: 'IP地址' },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 1 ? 'default' : 'destructive'}>
          {row.original.status === 1 ? '成功' : '失败'}
        </Badge>
      ),
    },
    { accessorKey: 'duration', header: '耗时', cell: ({ row }) => `${row.original.duration}ms` },
    { accessorKey: 'createUser', header: '操作人' },
    { accessorKey: 'createTime', header: '操作时间' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => { setCurrent(row.original); setDetailOpen(true) }}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const handleSearchClick = () =>
    handleSearch({
      module: module || undefined,
      status: status ? Number(status) : undefined,
      createUser: createUser || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
    } as any)

  const handleResetClick = () => {
    setModule(''); setStatus(''); setCreateUser(''); setStartTime(''); setEndTime('')
    handleReset()
  }

  const handleExport = async () => {
    try {
      const blob = await exportOperationLog()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'operation-log.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('导出失败')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">操作日志</h1>
        <p className="text-sm text-muted-foreground mt-1">系统操作日志记录</p>
      </div>

      <div className="rounded border p-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label>模块</Label>
            <Input placeholder="请输入模块名" value={module} onChange={(e) => setModule(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>操作人</Label>
            <Input placeholder="请输入操作人" value={createUser} onChange={(e) => setCreateUser(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>状态</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="全部" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">成功</SelectItem>
                <SelectItem value="0">失败</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>开始时间</Label>
            <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>结束时间</Label>
            <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleResetClick}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />重置
          </Button>
          <Button size="sm" onClick={handleSearchClick}>
            <Search className="mr-1.5 h-3.5 w-3.5" />搜索
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-1.5 h-3.5 w-3.5" />导出
        </Button>
      </div>

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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>操作日志详情</DialogTitle></DialogHeader>
          {current && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">模块：</span>{current.module}</div>
              <div><span className="text-muted-foreground">请求方式：</span>{current.requestMethod}</div>
              <div className="col-span-2"><span className="text-muted-foreground">描述：</span>{current.description}</div>
              <div className="col-span-2"><span className="text-muted-foreground">请求地址：</span>{current.requestUrl}</div>
              <div className="col-span-2"><span className="text-muted-foreground">请求参数：</span><pre className="text-xs mt-1 bg-muted p-2 rounded overflow-auto">{current.requestParams}</pre></div>
              <div className="col-span-2"><span className="text-muted-foreground">响应结果：</span><pre className="text-xs mt-1 bg-muted p-2 rounded overflow-auto max-h-32">{current.response}</pre></div>
              <div><span className="text-muted-foreground">IP地址：</span>{current.ip}</div>
              <div><span className="text-muted-foreground">操作人：</span>{current.createUser}</div>
              <div>
                <span className="text-muted-foreground">状态：</span>
                <Badge variant={current.status === 1 ? 'default' : 'destructive'}>
                  {current.status === 1 ? '成功' : '失败'}
                </Badge>
              </div>
              <div><span className="text-muted-foreground">耗时：</span>{current.duration}ms</div>
              {current.errorMsg && (
                <div className="col-span-2"><span className="text-muted-foreground">错误信息：</span><span className="text-destructive">{current.errorMsg}</span></div>
              )}
              <div className="col-span-2"><span className="text-muted-foreground">操作时间：</span>{current.createTime}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
