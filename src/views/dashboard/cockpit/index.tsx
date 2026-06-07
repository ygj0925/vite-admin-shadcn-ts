import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, LayoutGrid, List, Search, BarChart3, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/data-table'
import { toast } from 'sonner'
import {
  listTaskItems, getTaskStats, listTaskCategoriesPermitted,
  type TaskItem, type TaskStats, type TaskCategory,
} from '@/apis/dashboard/task'
import type { ColumnDef } from '@tanstack/react-table'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: '进行中', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  at_risk: { label: '有风险', color: 'bg-yellow-100 text-yellow-700' },
  blocked: { label: '已阻塞', color: 'bg-red-100 text-red-700' },
}

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  P0: { label: 'P0', color: 'bg-red-100 text-red-700' },
  P1: { label: 'P1', color: 'bg-orange-100 text-orange-700' },
  P2: { label: 'P2', color: 'bg-yellow-100 text-yellow-700' },
  P3: { label: 'P3', color: 'bg-gray-100 text-gray-700' },
}

export default function CockpitPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [categories, setCategories] = useState<TaskCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const size = 20

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { page, size, sort: ['createTime,desc'] }
      if (keyword) params.keyword = keyword
      if (statusFilter) params.status = [statusFilter]
      if (priorityFilter) params.priority = [priorityFilter]
      if (categoryId) params.categoryId = Number(categoryId)

      const [taskRes, statsRes] = await Promise.all([
        listTaskItems(params as any),
        getTaskStats(params),
      ])
      setTasks(taskRes.data?.list ?? [])
      setTotal(taskRes.data?.total ?? 0)
      setStats(statsRes.data ?? null)
    } catch {
      // handled
    } finally {
      setLoading(false)
    }
  }, [keyword, statusFilter, priorityFilter, categoryId, page])

  useEffect(() => {
    listTaskCategoriesPermitted().then((res) => setCategories(res.data ?? [])).catch(() => {})
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const statCards = stats ? [
    { label: '总任务', value: stats.total, icon: BarChart3, color: 'text-blue-500' },
    { label: '进行中', value: stats.inProgress, icon: Clock, color: 'text-blue-500' },
    { label: '已完成', value: stats.completed, icon: CheckCircle2, color: 'text-green-500' },
    { label: '有风险', value: stats.atRisk, icon: AlertTriangle, color: 'text-yellow-500' },
    { label: '已阻塞', value: stats.blocked, icon: XCircle, color: 'text-red-500' },
    { label: '已逾期', value: stats.overdue, icon: AlertTriangle, color: 'text-red-500' },
  ] : []

  const columns: ColumnDef<TaskItem>[] = [
    { accessorKey: 'code', header: '编号', size: 100 },
    {
      accessorKey: 'title', header: '标题', size: 250,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span className="truncate">{row.original.title}</span>
          {row.original.isOverdue && <Badge variant="destructive" className="text-[10px] px-1">逾期</Badge>}
        </div>
      ),
    },
    {
      accessorKey: 'status', header: '状态', size: 90,
      cell: ({ row }) => {
        const s = STATUS_MAP[row.original.status]
        return s ? <Badge className={s.color}>{s.label}</Badge> : row.original.status
      },
    },
    {
      accessorKey: 'priority', header: '优先级', size: 70,
      cell: ({ row }) => {
        const p = PRIORITY_MAP[row.original.priority]
        return p ? <Badge className={p.color}>{p.label}</Badge> : row.original.priority
      },
    },
    {
      accessorKey: 'owners', header: '负责人', size: 120,
      cell: ({ row }) => row.original.owners?.map((o) => o.nickname).join(', ') || '-',
    },
    { accessorKey: 'dueDate', header: '截止日期', size: 110 },
    { accessorKey: 'latestProgress', header: '最新进展', size: 200, cell: ({ row }) => <span className="truncate block max-w-[200px]">{row.original.latestProgress || '-'}</span> },
  ]

  return (
    <div className="space-y-4">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <card.icon className={`h-8 w-8 ${card.color}`} />
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索任务..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1) }} className="h-8 w-48 pl-8" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="h-8 w-28"><SelectValue placeholder="状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="h-8 w-28"><SelectValue placeholder="优先级" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部优先级</SelectItem>
            {Object.entries(PRIORITY_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryId} onValueChange={(v) => { setCategoryId(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="h-8 w-36"><SelectValue placeholder="分类" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => fetchData()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> 刷新
        </Button>
      </div>

      {/* 任务表格 */}
      <DataTable columns={columns} data={tasks} loading={loading}
        total={total} page={page} size={size}
        onPageChange={setPage} />
    </div>
  )
}
