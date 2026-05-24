import { useState, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Eye,
  Trash2,
  CheckCheck,
  Search,
  Bell,
  Megaphone,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/data-table'
import { DeleteConfirm } from '@/components/delete-confirm'
import { useCrud } from '@/hooks/use-crud'
import {
  getMessagePage,
  getMessageById,
  readMessage,
  readAllMessages,
  deleteMessage,
  type Message,
} from '@/apis/user/message'
import {
  getNoticePage,
  type Notice,
} from '@/apis/system/notice'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const messageTypes: Record<number, string> = {
  1: '通知',
  2: '公告',
}

const noticeTypes: Record<number, string> = {
  1: '通知',
  2: '公告',
}

/* ------------------------------------------------------------------ */
/*  My Messages Tab                                                  */
/* ------------------------------------------------------------------ */

function MyMessageTab({ unreadCount }: { unreadCount: number }) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [current, setCurrent] = useState<Message | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const query: Record<string, unknown> = { ...params }
      if (typeFilter !== 'all') query.type = Number(typeFilter)
      if (statusFilter !== 'all') query.status = Number(statusFilter)
      return getMessagePage(query as any)
    },
    [typeFilter, statusFilter],
  )

  const {
    data,
    total,
    loading,
    query,
    selectedIds,
    setSelectedIds,
    fetchData,
    handlePageChange,
    handleSizeChange,
  } = useCrud<Message, any>({ listApi })

  const handleRead = async (row: Message) => {
    try {
      const res = await getMessageById(row.id)
      setCurrent(res.data)
      setDetailOpen(true)
      if (row.status === 0) {
        await readMessage([String(row.id)])
        fetchData()
      }
    } catch {
      // handled by interceptor
    }
  }

  const handleReadAll = async () => {
    try {
      await readAllMessages()
      toast.success('全部已读')
      fetchData()
    } catch {
      // handled by interceptor
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMessage([String(deleteTarget.id)])
      toast.success('删除成功')
      setDeleteOpen(false)
      setDeleteTarget(null)
      fetchData()
    } catch {
      // handled by interceptor
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return
    try {
      await deleteMessage(selectedIds)
      toast.success('删除成功')
      setBatchDeleteOpen(false)
      setSelectedIds([])
      fetchData()
    } catch {
      // handled by interceptor
    }
  }

  const columns: ColumnDef<Message, any>[] = [
    { accessorKey: 'title', header: '标题' },
    {
      accessorKey: 'type',
      header: '类型',
      cell: ({ row }) => (
        <Badge variant={row.original.type === 1 ? 'default' : 'secondary'}>
          {messageTypes[row.original.type] || '未知'}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 1 ? 'outline' : 'destructive'}>
          {row.original.status === 1 ? '已读' : '未读'}
        </Badge>
      ),
    },
    { accessorKey: 'createTime', header: '创建时间' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRead(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              setDeleteTarget(row.original)
              setDeleteOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="消息类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="1">通知</SelectItem>
            <SelectItem value="2">公告</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="阅读状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="0">未读</SelectItem>
            <SelectItem value="1">已读</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        {selectedIds.length > 0 && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setBatchDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            批量删除 ({selectedIds.length})
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleReadAll}>
          <CheckCheck className="h-4 w-4 mr-1" />
          全部已读
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={query.page || 1}
        size={query.size || 10}
        loading={loading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
      />

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{current?.title}</DialogTitle>
          </DialogHeader>
          {current && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant={current.type === 1 ? 'default' : 'secondary'}
                >
                  {messageTypes[current.type] || '未知'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {current.createTime}
                </span>
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {current.content}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirm */}
      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />

      {/* Batch Delete Confirm */}
      <DeleteConfirm
        open={batchDeleteOpen}
        onOpenChange={setBatchDeleteOpen}
        count={selectedIds.length}
        onConfirm={handleBatchDelete}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Notices Tab                                                      */
/* ------------------------------------------------------------------ */

function MyNoticeTab() {
  const [detailOpen, setDetailOpen] = useState(false)
  const [current, setCurrent] = useState<Notice | null>(null)

  // Filters
  const [titleSearch, setTitleSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const listApi = useCallback(
    (params: Record<string, unknown>) => {
      const query: Record<string, unknown> = { ...params }
      if (titleSearch.trim()) query.title = titleSearch.trim()
      if (typeFilter !== 'all') query.type = Number(typeFilter)
      return getNoticePage(query as any)
    },
    [titleSearch, typeFilter],
  )

  const {
    data,
    total,
    loading,
    query,
    handlePageChange,
    handleSizeChange,
  } = useCrud<Notice, any>({ listApi })

  const handleView = (row: Notice) => {
    setCurrent(row)
    setDetailOpen(true)
  }

  const columns: ColumnDef<Notice, any>[] = [
    { accessorKey: 'title', header: '标题' },
    {
      accessorKey: 'type',
      header: '类型',
      cell: ({ row }) => (
        <Badge variant={row.original.type === 1 ? 'default' : 'secondary'}>
          {noticeTypes[row.original.type] || '未知'}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 1 ? 'outline' : 'secondary'}>
          {row.original.status === 1 ? '已发布' : '草稿'}
        </Badge>
      ),
    },
    { accessorKey: 'createTime', header: '创建时间' },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleView(row.original)}
        >
          <Eye className="h-4 w-4 mr-1" />
          查看
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索标题..."
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="公告类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="1">通知</SelectItem>
            <SelectItem value="2">公告</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{current?.title}</DialogTitle>
          </DialogHeader>
          {current && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant={current.type === 1 ? 'default' : 'secondary'}
                >
                  {noticeTypes[current.type] || '未知'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {current.createTime}
                </span>
              </div>
              <div
                className="text-sm prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: current.content }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                        */
/* ------------------------------------------------------------------ */

export default function MessagePage() {
  // We track unread count via a simple state that the child can update
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch initial unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getMessagePage({ page: 1, size: 1, status: 0 } as any)
      setUnreadCount(res.data.total)
    } catch {
      // ignore
    }
  }, [])

  // Fetch on mount
  useState(() => {
    fetchUnreadCount()
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">消息中心</h1>
        <p className="text-sm text-muted-foreground mt-1">
          系统消息与通知公告
        </p>
      </div>

      <Tabs defaultValue="message" className="w-full">
        <TabsList>
          <TabsTrigger value="message" className="gap-1.5">
            <Bell className="h-4 w-4" />
            我的消息
            {unreadCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="notice" className="gap-1.5">
            <Megaphone className="h-4 w-4" />
            通知公告
          </TabsTrigger>
        </TabsList>

        <TabsContent value="message" className="mt-4">
          <MyMessageTab unreadCount={unreadCount} />
        </TabsContent>

        <TabsContent value="notice" className="mt-4">
          <MyNoticeTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
