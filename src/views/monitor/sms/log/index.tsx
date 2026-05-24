import { useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table'
import { useCrud } from '@/hooks/use-crud'
import { get } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

interface SmsLog {
  id: string
  phone: string
  content: string
  provider: string
  status: number
  sendTime: string
  createTime: string
}

function getSmsLogPage(params: PageQuery) {
  return get<PageRes<SmsLog>>('/system/sms/log', params as Record<string, unknown>)
}

export default function SmsLogPage() {
  const listApi = useCallback((params: Record<string, unknown>) => getSmsLogPage(params as any), [])

  const { data, total, loading, query, handlePageChange, handleSizeChange } = useCrud<SmsLog, any>({
    listApi,
  })

  const columns: ColumnDef<SmsLog, any>[] = [
    { accessorKey: 'phone', header: '手机号' },
    { accessorKey: 'content', header: '内容' },
    { accessorKey: 'provider', header: '服务商' },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 1 ? 'default' : 'destructive'}>
          {row.original.status === 1 ? '成功' : '失败'}
        </Badge>
      ),
    },
    { accessorKey: 'sendTime', header: '发送时间' },
    { accessorKey: 'createTime', header: '创建时间' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">短信日志</h1>
        <p className="text-sm text-muted-foreground mt-1">短信发送记录</p>
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
    </div>
  )
}
