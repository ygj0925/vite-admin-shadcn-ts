import { useState, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { LogOut, Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/data-table'
import { DeleteConfirm } from '@/components/delete-confirm'
import { useCrud } from '@/hooks/use-crud'
import { getOnlineUserPage, kickoutOnlineUser, type OnlineUser } from '@/apis/monitor/online'
import { toast } from 'sonner'

export default function OnlineUserPage() {
  const [nickname, setNickname] = useState('')
  const [kickOpen, setKickOpen] = useState(false)
  const [kickTarget, setKickTarget] = useState<OnlineUser | null>(null)

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const q: Record<string, unknown> = { ...params }
      if (nickname) q.nickname = nickname
      return getOnlineUserPage(q as any)
    },
    [nickname],
  )

  const { data, total, loading, query, fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange } =
    useCrud<OnlineUser, any>({ listApi })

  const handleKickout = async () => {
    if (!kickTarget) return
    try {
      await kickoutOnlineUser(kickTarget.token)
      toast.success('强退成功')
      setKickOpen(false)
      setKickTarget(null)
      fetchData()
    } catch {
      // handled by interceptor
    }
  }

  const columns: ColumnDef<OnlineUser, any>[] = [
    { accessorKey: 'username', header: '用户名' },
    { accessorKey: 'nickname', header: '昵称' },
    { accessorKey: 'ip', header: 'IP地址' },
    { accessorKey: 'address', header: '登录地点' },
    { accessorKey: 'browser', header: '浏览器' },
    { accessorKey: 'os', header: '操作系统' },
    { accessorKey: 'loginTime', header: '登录时间' },
    { accessorKey: 'lastActiveTime', header: '最后活跃', cell: ({ row }) => (row.original as any).lastActiveTime || '-' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => { setKickTarget(row.original); setKickOpen(true) }}
        >
          <LogOut className="h-4 w-4 mr-1" />强退
        </Button>
      ),
    },
  ]

  const handleSearchClick = () => handleSearch({ nickname: nickname || undefined } as any)
  const handleResetClick = () => { setNickname(''); handleReset() }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">在线用户</h1>
        <p className="text-sm text-muted-foreground mt-1">当前在线用户列表</p>
      </div>

      <div className="flex items-end gap-3">
        <div className="space-y-1.5">
          <Label>昵称</Label>
          <Input placeholder="请输入昵称" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-48" />
        </div>
        <Button size="sm" onClick={handleSearchClick}>
          <Search className="mr-1.5 h-3.5 w-3.5" />搜索
        </Button>
        <Button size="sm" variant="outline" onClick={handleResetClick}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />重置
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

      <DeleteConfirm
        open={kickOpen}
        onOpenChange={setKickOpen}
        onConfirm={handleKickout}
      />
    </div>
  )
}
