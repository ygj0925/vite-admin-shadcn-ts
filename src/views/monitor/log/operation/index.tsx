import { useState, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/data-table'
import { useCrud } from '@/hooks/use-crud'
import { getOperationLogPage, type LogEntry } from '@/apis/monitor/log'

export default function OperationLogPage() {
  const [module, setModule] = useState('')
  const [status, setStatus] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [current, setCurrent] = useState<LogEntry | null>(null)

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const query: Record<string, unknown> = { ...params }
      if (module) query.module = module
      if (status) query.status = status
      return getOperationLogPage(query as any)
    },
    [module, status]
  )

  const { data, total, loading, query, handleSearch, handleReset, handlePageChange, handleSizeChange } = useCrud<LogEntry, any>({
    listApi,
  })

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
    {
      accessorKey: 'duration',
      header: '耗时',
      cell: ({ row }) => `${row.original.duration}ms`,
    },
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

  const handleSearchClick = () => handleSearch({ module, status: status ? Number(status) : undefined } as any)
  const handleResetClick = () => { setModule(''); setStatus(''); handleReset() }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">操作日志</h1>
        <p className="text-sm text-muted-foreground mt-1">系统操作日志记录</p>
      </div>

      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">模块</Label>
          <Input placeholder="请输入模块名" value={module} onChange={(e) => setModule(e.target.value)} className="h-8 w-48" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">状态</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-32"><SelectValue placeholder="全部" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">成功</SelectItem>
              <SelectItem value="0">失败</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleSearchClick}><Search className="h-4 w-4 mr-1" />搜索</Button>
        <Button size="sm" variant="outline" onClick={handleResetClick}><RotateCcw className="h-4 w-4 mr-1" />重置</Button>
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
          <DialogHeader>
            <DialogTitle>操作日志详情</DialogTitle>
          </DialogHeader>
          {current && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">模块：</span>{current.module}</div>
              <div><span className="text-muted-foreground">请求方式：</span>{current.requestMethod}</div>
              <div className="col-span-2"><span className="text-muted-foreground">描述：</span>{current.description}</div>
              <div className="col-span-2"><span className="text-muted-foreground">请求地址：</span>{current.requestUrl}</div>
              <div className="col-span-2"><span className="text-muted-foreground">请求参数：</span>{current.requestParams}</div>
              <div className="col-span-2"><span className="text-muted-foreground">响应结果：</span>{current.response}</div>
              <div><span className="text-muted-foreground">IP地址：</span>{current.ip}</div>
              <div><span className="text-muted-foreground">操作人：</span>{current.createUser}</div>
              <div>
                <span className="text-muted-foreground">状态：</span>
                <Badge variant={current.status === 1 ? 'default' : 'destructive'}>
                  {current.status === 1 ? '成功' : '失败'}
                </Badge>
              </div>
              <div><span className="text-muted-foreground">耗时：</span>{current.duration}ms</div>
              {current.errorMsg && <div className="col-span-2"><span className="text-muted-foreground">错误信息：</span>{current.errorMsg}</div>}
              <div className="col-span-2"><span className="text-muted-foreground">操作时间：</span>{current.createTime}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
