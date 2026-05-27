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
