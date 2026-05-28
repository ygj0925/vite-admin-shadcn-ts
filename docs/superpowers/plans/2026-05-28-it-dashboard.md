# IT项目管理看板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建两个无需登录的IT项目管理看板页面，展示项目交付、满意度、资源使用和IT价值

**Architecture:** 两个独立页面（单页面看板 + 多Tab看板）位于AuthGuard外，共享数据类型和模拟数据，使用现有shadcn/ui组件和recharts图表

**Tech Stack:** React 19, TypeScript, shadcn/ui, recharts, lucide-react, React Router

---

## 文件结构

```
src/views/it-dashboard/
├── data.ts            # 共享类型定义和模拟数据
├── index.tsx          # 方案A：单页面看板
└── tabs/
    └── index.tsx      # 方案B：多Tab分区看板
```

**修改文件：**
- `src/app/router.tsx` - 添加两个公开路由

---

## Task 1: 创建共享数据类型和模拟数据

**Files:**
- Create: `src/views/it-dashboard/data.ts`

- [ ] **Step 1: 创建数据类型和模拟数据文件**

```typescript
import {
  TrendingUp,
  Users,
  CheckCircle,
  DollarSign,
  Clock,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'

// 核心指标
export interface OverviewMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: LucideIcon
  color: string
}

// 项目信息
export interface Project {
  id: string
  name: string
  status: '进行中' | '已完成' | '延期' | '规划中'
  progress: number
  manager: string
  deadline: string
  type: string
}

// 反馈信息
export interface Feedback {
  content: string
  department: string
  rating: number
  date: string
}

// 满意度数据
export interface SatisfactionData {
  overall: number
  nps: number
  responseRate: number
  trend: { month: string; score: number }[]
  departmentScores: { name: string; score: number }[]
  recentFeedback: Feedback[]
}

// 资源数据
export interface ResourceData {
  teamSize: number
  utilization: number
  overtimeRate: number
  skillCoverage: number
  memberUtilization: { name: string; rate: number }[]
  skillDistribution: { name: string; value: number }[]
  monthlyHours: { month: string; hours: number }[]
}

// 价值案例
export interface ValueCase {
  title: string
  description: string
  benefit: string
  icon: string
}

// IT价值数据
export interface ValueData {
  roi: number
  costSaving: number
  efficiencyGain: number
  availability: number
  roiTrend: { month: string; value: number }[]
  costSavingTrend: { month: string; value: number }[]
  cases: ValueCase[]
}

// 项目状态分布
export interface ProjectStatusData {
  name: string
  value: number
}

// 交付趋势
export interface DeliveryTrend {
  month: string
  rate: number
}

// 资源分配
export interface ResourceAllocation {
  name: string
  days: number
}

// 成本节省趋势
export interface CostSavingTrend {
  month: string
  saved: number
}

// =================================================================
// 模拟数据
// =================================================================

// 核心指标
export const overviewMetrics: OverviewMetric[] = [
  {
    title: '项目交付率',
    value: '92.5%',
    change: '+5.2%',
    trend: 'up',
    icon: CheckCircle,
    color: '#10b981',
  },
  {
    title: '满意度评分',
    value: '4.6/5.0',
    change: '+0.3',
    trend: 'up',
    icon: TrendingUp,
    color: '#3b82f6',
  },
  {
    title: '资源利用率',
    value: '78%',
    change: '-2%',
    trend: 'down',
    icon: Users,
    color: '#f59e0b',
  },
  {
    title: 'ROI倍数',
    value: '3.2x',
    change: '+0.5',
    trend: 'up',
    icon: DollarSign,
    color: '#8b5cf6',
  },
]

// 项目列表
export const projects: Project[] = [
  {
    id: '1',
    name: 'ERP系统升级',
    status: '进行中',
    progress: 75,
    manager: '张三',
    deadline: '2026-06-30',
    type: '基础设施',
  },
  {
    id: '2',
    name: 'OA系统重构',
    status: '进行中',
    progress: 45,
    manager: '李四',
    deadline: '2026-07-15',
    type: '办公协同',
  },
  {
    id: '3',
    name: '数据平台建设',
    status: '已完成',
    progress: 100,
    manager: '王五',
    deadline: '2026-05-20',
    type: '数据分析',
  },
  {
    id: '4',
    name: '移动办公APP',
    status: '进行中',
    progress: 60,
    manager: '赵六',
    deadline: '2026-08-01',
    type: '移动应用',
  },
  {
    id: '5',
    name: '安全合规整改',
    status: '延期',
    progress: 30,
    manager: '钱七',
    deadline: '2026-05-15',
    type: '安全合规',
  },
  {
    id: '6',
    name: '客服系统优化',
    status: '规划中',
    progress: 0,
    manager: '孙八',
    deadline: '2026-09-30',
    type: '客户服务',
  },
]

// 项目状态分布
export const projectStatusData: ProjectStatusData[] = [
  { name: '进行中', value: 8 },
  { name: '已完成', value: 14 },
  { name: '延期', value: 2 },
  { name: '规划中', value: 3 },
]

// 交付趋势（近6个月）
export const deliveryTrend: DeliveryTrend[] = [
  { month: '2025-12', rate: 85 },
  { month: '2026-01', rate: 88 },
  { month: '2026-02', rate: 82 },
  { month: '2026-03', rate: 90 },
  { month: '2026-04', rate: 87 },
  { month: '2026-05', rate: 92.5 },
]

// 资源分配（各项目人天）
export const resourceAllocation: ResourceAllocation[] = [
  { name: 'ERP升级', days: 450 },
  { name: 'OA重构', days: 320 },
  { name: '数据平台', days: 280 },
  { name: '移动APP', days: 200 },
  { name: '安全整改', days: 150 },
]

// 成本节省趋势（近6个月，万元）
export const costSavingTrend: CostSavingTrend[] = [
  { month: '2025-12', saved: 18 },
  { month: '2026-01', saved: 22 },
  { month: '2026-02', saved: 19 },
  { month: '2026-03', saved: 25 },
  { month: '2026-04', saved: 28 },
  { month: '2026-05', saved: 32 },
]

// 满意度数据
export const satisfactionData: SatisfactionData = {
  overall: 4.6,
  nps: 68,
  responseRate: 92,
  trend: [
    { month: '2025-12', score: 4.2 },
    { month: '2026-01', score: 4.3 },
    { month: '2026-02', score: 4.1 },
    { month: '2026-03', score: 4.4 },
    { month: '2026-04', score: 4.5 },
    { month: '2026-05', score: 4.6 },
  ],
  departmentScores: [
    { name: '销售部', score: 4.8 },
    { name: '财务部', score: 4.6 },
    { name: '人事部', score: 4.5 },
    { name: '生产部', score: 4.4 },
    { name: '研发部', score: 4.3 },
  ],
  recentFeedback: [
    {
      content: 'ERP系统响应速度很快，大大提升了工作效率',
      department: '销售部',
      rating: 5,
      date: '2026-05-25',
    },
    {
      content: 'OA审批流程还需要进一步优化',
      department: '人事部',
      rating: 4,
      date: '2026-05-23',
    },
    {
      content: '数据平台的报表功能非常实用',
      department: '财务部',
      rating: 5,
      date: '2026-05-20',
    },
  ],
}

// 资源数据
export const resourceData: ResourceData = {
  teamSize: 32,
  utilization: 78,
  overtimeRate: 12,
  skillCoverage: 85,
  memberUtilization: [
    { name: '张三', rate: 92 },
    { name: '李四', rate: 88 },
    { name: '王五', rate: 85 },
    { name: '赵六', rate: 78 },
    { name: '钱七', rate: 75 },
    { name: '孙八', rate: 70 },
  ],
  skillDistribution: [
    { name: 'Java', value: 35 },
    { name: 'React', value: 25 },
    { name: 'Python', value: 20 },
    { name: 'DevOps', value: 15 },
    { name: '其他', value: 5 },
  ],
  monthlyHours: [
    { month: '2025-12', hours: 4800 },
    { month: '2026-01', hours: 5200 },
    { month: '2026-02', hours: 4600 },
    { month: '2026-03', hours: 5100 },
    { month: '2026-04', hours: 5400 },
    { month: '2026-05', hours: 5000 },
  ],
}

// IT价值数据
export const valueData: ValueData = {
  roi: 3.2,
  costSaving: 128,
  efficiencyGain: 35,
  availability: 99.9,
  roiTrend: [
    { month: '2025-12', value: 2.5 },
    { month: '2026-01', value: 2.7 },
    { month: '2026-02', value: 2.8 },
    { month: '2026-03', value: 3.0 },
    { month: '2026-04', value: 3.1 },
    { month: '2026-05', value: 3.2 },
  ],
  costSavingTrend: [
    { month: '2025-12', saved: 18 },
    { month: '2026-01', saved: 22 },
    { month: '2026-02', saved: 19 },
    { month: '2026-03', saved: 25 },
    { month: '2026-04', saved: 28 },
    { month: '2026-05', saved: 32 },
  ],
  cases: [
    {
      title: 'ERP自动化流程',
      description: '实现采购、库存、财务自动化处理',
      benefit: '节省人工40h/月，年化节省¥48万',
      icon: 'Package',
    },
    {
      title: '数据决策平台',
      description: '实时数据分析与可视化报表',
      benefit: '决策效率提升50%，减少误判损失¥30万',
      icon: 'BarChart3',
    },
    {
      title: '移动办公系统',
      description: '随时随地审批、协作、沟通',
      benefit: '响应速度提升60%，员工满意度+15%',
      icon: 'Smartphone',
    },
  ],
}

// 项目类型分布（用于方案B Tab1）
export const projectTypeData = [
  { name: '基础设施', value: 8 },
  { name: '办公协同', value: 6 },
  { name: '数据分析', value: 5 },
  { name: '移动应用', value: 4 },
  { name: '安全合规', value: 3 },
  { name: '客户服务', value: 1 },
]
```

- [ ] **Step 2: 验证文件创建成功**

Run: `ls -la src/views/it-dashboard/`
Expected: 看到 `data.ts` 文件

---

## Task 2: 实现方案A - 单页面看板

**Files:**
- Create: `src/views/it-dashboard/index.tsx`

- [ ] **Step 1: 创建单页面看板组件**

```tsx
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChartContainer, TESLA_COLORS } from '@/components/chart'
import {
  overviewMetrics,
  projects,
  projectStatusData,
  deliveryTrend,
  resourceAllocation,
  costSavingTrend,
} from './data'

const PIE_COLORS = [TESLA_COLORS[0], '#10b981', '#f59e0b', '#8b5cf6']

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  '进行中': 'default',
  '已完成': 'secondary',
  '延期': 'destructive',
  '规划中': 'outline',
}

export default function ITDashboardPage() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">IT项目管理看板</h1>
          <p className="text-sm text-muted-foreground mt-1">
            展示IT部门项目交付、资源使用和价值贡献
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          最后更新: 2026-05-28
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={
                        metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                      }
                    >
                      {metric.change} 较上月
                    </span>
                  </div>
                </div>
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${metric.color}14` }}
                >
                  <metric.icon className="h-5 w-5" style={{ color: metric.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 图表区域 - 2x2网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 项目状态分布 - 饼图 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">项目状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ChartContainer height={200}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {projectStatusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                  />
                </PieChart>
              </ChartContainer>
              <div className="space-y-2 text-sm">
                {projectStatusData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="ml-auto font-medium">{item.value}个</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 交付趋势 - 折线图 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">交付趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer height={220}>
              <LineChart data={deliveryTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#d0d0d0"
                  domain={[70, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(v: number) => `${v}%`}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="交付率"
                  stroke={TESLA_COLORS[0]}
                  strokeWidth={2}
                  dot={{ fill: TESLA_COLORS[0], r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 资源分配 - 柱状图 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">资源分配（人天）</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer height={220}>
              <BarChart data={resourceAllocation} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#d0d0d0" />
                <YAxis tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                />
                <Bar dataKey="days" name="人天" radius={[4, 4, 0, 0]}>
                  {resourceAllocation.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? TESLA_COLORS[0] : TESLA_COLORS[0] + (i % 2 === 0 ? 'cc' : '99')}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 成本节省 - 面积图 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">成本节省趋势（万元）</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer height={220}>
              <AreaChart data={costSavingTrend}>
                <defs>
                  <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                <YAxis tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                <Tooltip
                  formatter={(v: number) => `¥${v}万`}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="saved"
                  name="节省金额"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#savedGrad)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* 近期重点项目 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">近期重点项目</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-4 p-3 rounded-lg border"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{project.name}</span>
                    <Badge variant={statusVariant[project.status] || 'outline'}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>负责人: {project.manager}</span>
                    <span>截止: {project.deadline}</span>
                  </div>
                </div>
                <div className="w-48">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">进度</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: 验证文件创建成功**

Run: `ls -la src/views/it-dashboard/`
Expected: 看到 `data.ts` 和 `index.tsx` 文件

---

## Task 3: 实现方案B - 多Tab分区看板

**Files:**
- Create: `src/views/it-dashboard/tabs/index.tsx`

- [ ] **Step 1: 创建多Tab看板组件**

```tsx
import { useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  BarChart3,
  Smartphone,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChartContainer, TESLA_COLORS } from '@/components/chart'
import {
  projects,
  projectStatusData,
  projectTypeData,
  deliveryTrend,
  satisfactionData,
  resourceData,
  valueData,
} from '../data'

const PIE_COLORS = [TESLA_COLORS[0], '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  '进行中': 'default',
  '已完成': 'secondary',
  '延期': 'destructive',
  '规划中': 'outline',
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Package,
  BarChart3,
  Smartphone,
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down'
  trendValue?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
            {trendValue && (
              <div className="flex items-center gap-1 text-xs">
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={trend === 'up' ? 'text-emerald-600' : 'text-red-600'}>
                  {trendValue}
                </span>
              </div>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

export default function ITDashboardTabsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('全部')

  const filteredProjects =
    statusFilter === '全部'
      ? projects
      : projects.filter((p) => p.status === statusFilter)

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">IT项目管理看板</h1>
        <p className="text-sm text-muted-foreground mt-1">
          多维度展示IT部门项目管理情况
        </p>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">项目概览</TabsTrigger>
          <TabsTrigger value="satisfaction">满意度</TabsTrigger>
          <TabsTrigger value="resources">资源使用</TabsTrigger>
          <TabsTrigger value="value">IT价值</TabsTrigger>
        </TabsList>

        {/* Tab 1: 项目概览 */}
        <TabsContent value="projects" className="space-y-6">
          {/* 指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="总项目数" value={24} icon={Package} />
            <MetricCard title="进行中" value={8} icon={Clock} />
            <MetricCard title="已完成" value={14} icon={CheckCircle} />
            <MetricCard title="延期" value={2} icon={TrendingDown} />
          </div>

          {/* 图表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">交付趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer height={250}>
                  <LineChart data={deliveryTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#d0d0d0"
                      domain={[70, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(v: number) => `${v}%`}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      name="交付率"
                      stroke={TESLA_COLORS[0]}
                      strokeWidth={2}
                      dot={{ fill: TESLA_COLORS[0], r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">项目类型分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <ChartContainer height={250}>
                    <PieChart>
                      <Pie
                        data={projectTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {projectTypeData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                      />
                    </PieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 项目列表 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">项目列表</CardTitle>
                <div className="flex gap-2">
                  {['全部', '进行中', '已完成', '延期', '规划中'].map((status) => (
                    <Badge
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>项目名称</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>负责人</TableHead>
                    <TableHead>进度</TableHead>
                    <TableHead>截止日期</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[project.status] || 'outline'}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{project.manager}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="h-2 w-24" />
                          <span className="text-xs">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{project.deadline}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: 满意度 */}
        <TabsContent value="satisfaction" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard title="综合评分" value={`${satisfactionData.overall}/5.0`} icon={Star} />
            <MetricCard title="NPS" value={satisfactionData.nps} icon={TrendingUp} />
            <MetricCard title="响应满意度" value={`${satisfactionData.responseRate}%`} icon={CheckCircle} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">满意度趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer height={250}>
                  <LineChart data={satisfactionData.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#d0d0d0"
                      domain={[3.5, 5]}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="评分"
                      stroke={TESLA_COLORS[0]}
                      strokeWidth={2}
                      dot={{ fill: TESLA_COLORS[0], r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">各部门评分</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer height={250}>
                  <BarChart data={satisfactionData.departmentScores} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#d0d0d0" domain={[3.5, 5]} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                    />
                    <Bar dataKey="score" name="评分" radius={[4, 4, 0, 0]}>
                      {satisfactionData.departmentScores.map((_, i) => (
                        <Cell
                          key={i}
                          fill={TESLA_COLORS[0] + (i % 2 === 0 ? 'cc' : '99')}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">近期反馈</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {satisfactionData.recentFeedback.map((feedback, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm">{feedback.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{feedback.department}</span>
                        <span>{feedback.date}</span>
                      </div>
                    </div>
                    <StarRating rating={feedback.rating} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: 资源使用 */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="团队规模" value={`${resourceData.teamSize}人`} icon={Users} />
            <MetricCard title="利用率" value={`${resourceData.utilization}%`} icon={TrendingUp} />
            <MetricCard title="加班率" value={`${resourceData.overtimeRate}%`} icon={Clock} />
            <MetricCard title="技能覆盖" value={`${resourceData.skillCoverage}%`} icon={CheckCircle} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">人员利用率</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer height={250}>
                  <BarChart data={resourceData.memberUtilization} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#d0d0d0"
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(v: number) => `${v}%`}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                    />
                    <Bar dataKey="rate" name="利用率" radius={[4, 4, 0, 0]}>
                      {resourceData.memberUtilization.map((_, i) => (
                        <Cell
                          key={i}
                          fill={TESLA_COLORS[0] + (i % 2 === 0 ? 'cc' : '99')}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">技能分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <ChartContainer height={250}>
                    <PieChart>
                      <Pie
                        data={resourceData.skillDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {resourceData.skillDistribution.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => `${v}%`}
                        contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                      />
                    </PieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">工时统计</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer height={250}>
                <AreaChart data={resourceData.monthlyHours}>
                  <defs>
                    <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TESLA_COLORS[0]} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={TESLA_COLORS[0]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                  <Tooltip
                    formatter={(v: number) => `${v}h`}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    name="工时"
                    stroke={TESLA_COLORS[0]}
                    strokeWidth={2}
                    fill="url(#hoursGrad)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: IT价值 */}
        <TabsContent value="value" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="ROI" value={`${valueData.roi}x`} icon={DollarSign} trend="up" trendValue="+0.5" />
            <MetricCard title="成本节省" value={`¥${valueData.costSaving}万`} icon={TrendingUp} />
            <MetricCard title="效率提升" value={`${valueData.efficiencyGain}%`} icon={TrendingUp} />
            <MetricCard title="系统可用性" value={`${valueData.availability}%`} icon={CheckCircle} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">ROI趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer height={250}>
                  <LineChart data={valueData.roiTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                    <Tooltip
                      formatter={(v: number) => `${v}x`}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="ROI"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">成本节省趋势（万元）</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer height={250}>
                  <AreaChart data={valueData.costSavingTrend}>
                    <defs>
                      <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                    <Tooltip
                      formatter={(v: number) => `¥${v}万`}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="saved"
                      name="节省金额"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#valueGrad)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">价值案例</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {valueData.cases.map((caseItem, i) => {
                  const Icon = iconMap[caseItem.icon] || Package
                  return (
                    <div key={i} className="p-4 rounded-lg border">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium">{caseItem.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {caseItem.description}
                      </p>
                      <p className="text-sm font-medium text-emerald-600">
                        {caseItem.benefit}
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: 验证文件创建成功**

Run: `ls -la src/views/it-dashboard/tabs/`
Expected: 看到 `index.tsx` 文件

---

## Task 4: 配置路由

**Files:**
- Modify: `src/app/router.tsx`

- [ ] **Step 1: 添加懒加载导入**

在现有导入语句后添加：

```typescript
const ITDashboardPage = lazy(() => import('@/views/it-dashboard/index'))
const ITDashboardTabsPage = lazy(() => import('@/views/it-dashboard/tabs/index'))
```

- [ ] **Step 2: 添加公开路由**

在 `createBrowserRouter` 的路由配置中，在 `path: '/login'` 之后添加：

```typescript
{
  path: '/it-dashboard',
  element: wrap(ITDashboardPage),
},
{
  path: '/it-dashboard-tabs',
  element: wrap(ITDashboardTabsPage),
},
```

- [ ] **Step 3: 验证路由配置**

Run: `npm run build`
Expected: 编译成功，无TypeScript错误

---

## Task 5: 测试验证

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: 开发服务器启动成功

- [ ] **Step 2: 访问方案A页面**

在浏览器中访问: `http://localhost:5173/it-dashboard`
Expected: 看到单页面看板，包含4个指标卡片、4个图表、项目列表

- [ ] **Step 3: 访问方案B页面**

在浏览器中访问: `http://localhost:5173/it-dashboard-tabs`
Expected: 看到多Tab看板，4个Tab可切换，每个Tab展示对应内容

- [ ] **Step 4: 验证无需登录**

在无痕/隐私模式下访问两个页面
Expected: 无需登录即可正常显示

- [ ] **Step 5: 提交代码**

```bash
git add src/views/it-dashboard/ src/app/router.tsx
git commit -m "feat: add IT project management dashboards (no login required)"
```

---

## 完成

两个IT项目管理看板页面已创建完成：

1. **方案A** (`/it-dashboard`): 单页面看板，一屏展示所有关键指标
2. **方案B** (`/it-dashboard-tabs`): 多Tab分区看板，按维度详细展示

两个页面均无需登录即可访问，使用模拟数据，遵循shadcn/ui设计风格。
