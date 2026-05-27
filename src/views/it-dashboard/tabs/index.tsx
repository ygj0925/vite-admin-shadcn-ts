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
