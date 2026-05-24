import { useState, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { DeleteConfirm } from '@/components/delete-confirm'
import { useCrud } from '@/hooks/use-crud'
import { getOnlineUserPage, kickoutOnlineUser, type OnlineUser } from '@/apis/monitor/online'
import { toast } from 'sonner'

export default function OnlineUserPage() {
  const [kickOpen, setKickOpen] = useState(false)
  const [kickTarget, setKickTarget] = useState<OnlineUser | null>(null)

  const listApi = useCallback((params: Record<string, unknown>) => getOnlineUserPage(params as any), [])

  const { data, total, loading, query, fetchData, handlePageChange, handleSizeChange } = useCrud<OnlineUser, any>({
    listApi,
  })

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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">在线用户</h1>
        <p className="text-sm text-muted-foreground mt-1">当前在线用户列表</p>
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
