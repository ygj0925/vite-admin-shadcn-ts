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
import { getLoginLogPage, exportLoginLog, type LogEntry } from '@/apis/monitor/log'
import { toast } from 'sonner'

export default function LoginLogPage() {
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [current, setCurrent] = useState<LogEntry | null>(null)

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const q: Record<string, unknown> = { ...params }
      if (username) q.username = username
      if (status) q.status = Number(status)
      if (startTime) q.startTime = startTime
      if (endTime) q.endTime = endTime
      return getLoginLogPage(q as any)
    },
    [username, status, startTime, endTime],
  )

  const { data, total, loading, query, handleSearch, handleReset, handlePageChange, handleSizeChange } =
    useCrud<LogEntry, any>({ listApi })

  const columns: ColumnDef<LogEntry, any>[] = [
    { accessorKey: 'username', header: '用户名' },
    { accessorKey: 'ip', header: 'IP地址' },
    { accessorKey: 'address', header: '登录地点' },
    { accessorKey: 'browser', header: '浏览器' },
    { accessorKey: 'os', header: '操作系统' },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 1 ? 'default' : 'destructive'}>
          {row.original.status === 1 ? '成功' : '失败'}
        </Badge>
      ),
    },
    { accessorKey: 'description', header: '描述' },
    { accessorKey: 'createTime', header: '登录时间' },
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
    handleSearch({ username, status: status ? Number(status) : undefined, startTime: startTime || undefined, endTime: endTime || undefined } as any)

  const handleResetClick = () => {
    setUsername(''); setStatus(''); setStartTime(''); setEndTime('')
    handleReset()
  }

  const handleExport = async () => {
    try {
      const blob = await exportLoginLog()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'login-log.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('导出失败')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">登录日志</h1>
        <p className="text-sm text-muted-foreground mt-1">用户登录日志记录</p>
      </div>

      <div className="rounded border p-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label>用户名</Label>
            <Input placeholder="请输入用户名" value={username} onChange={(e) => setUsername(e.target.value)} />
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
          <DialogHeader><DialogTitle>登录日志详情</DialogTitle></DialogHeader>
          {current && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">用户名：</span>{current.username}</div>
              <div><span className="text-muted-foreground">IP地址：</span>{current.ip}</div>
              <div><span className="text-muted-foreground">登录地点：</span>{current.address}</div>
              <div><span className="text-muted-foreground">浏览器：</span>{current.browser}</div>
              <div><span className="text-muted-foreground">操作系统：</span>{current.os}</div>
              <div>
                <span className="text-muted-foreground">状态：</span>
                <Badge variant={current.status === 1 ? 'default' : 'destructive'}>
                  {current.status === 1 ? '成功' : '失败'}
                </Badge>
              </div>
              <div className="col-span-2"><span className="text-muted-foreground">描述：</span>{current.description}</div>
              <div className="col-span-2"><span className="text-muted-foreground">登录时间：</span>{current.createTime}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
