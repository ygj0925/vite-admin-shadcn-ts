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
import { getLoginLogPage, type LogEntry } from '@/apis/monitor/log'

export default function LoginLogPage() {
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [current, setCurrent] = useState<LogEntry | null>(null)

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const query: Record<string, unknown> = { ...params }
      if (username) query.username = username
      if (status) query.status = status
      return getLoginLogPage(query as any)
    },
    [username, status]
  )

  const { data, total, loading, query, handleSearch, handleReset, handlePageChange, handleSizeChange } = useCrud<LogEntry, any>({
    listApi,
  })

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

  const handleSearchClick = () => handleSearch({ username, status: status ? Number(status) : undefined } as any)
  const handleResetClick = () => { setUsername(''); setStatus(''); handleReset() }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">登录日志</h1>
        <p className="text-sm text-muted-foreground mt-1">用户登录日志记录</p>
      </div>

      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">用户名</Label>
          <Input placeholder="请输入用户名" value={username} onChange={(e) => setUsername(e.target.value)} className="h-8 w-48" />
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
            <DialogTitle>登录日志详情</DialogTitle>
          </DialogHeader>
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
