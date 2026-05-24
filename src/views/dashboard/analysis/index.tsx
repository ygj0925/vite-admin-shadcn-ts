import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  Globe,
  Monitor,
  Compass,
  LayoutGrid,
  Clock,
  Eye,
  Wifi,
  FileText,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, TESLA_COLORS } from '@/components/chart'

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const overviewStats = [
  { title: '页面浏览量 (PV)', value: '128,456', change: '+12.5%', icon: Eye, color: TESLA_COLORS[0] },
  { title: '独立访客 (IP)', value: '23,891', change: '+8.3%', icon: Wifi, color: TESLA_COLORS[1] },
  { title: '接口调用量', value: '456,789', change: '+15.2%', icon: FileText, color: TESLA_COLORS[2] },
  { title: '操作日志数', value: '89,012', change: '+5.7%', icon: BarChart3, color: TESLA_COLORS[3] },
]

const accessTrendData = [
  { date: '05-01', pv: 4200, uv: 2400 },
  { date: '05-02', pv: 3800, uv: 2100 },
  { date: '05-03', pv: 5100, uv: 2800 },
  { date: '05-04', pv: 4600, uv: 2600 },
  { date: '05-05', pv: 6200, uv: 3400 },
  { date: '05-06', pv: 5800, uv: 3100 },
  { date: '05-07', pv: 7100, uv: 3900 },
  { date: '05-08', pv: 6500, uv: 3600 },
  { date: '05-09', pv: 8200, uv: 4500 },
  { date: '05-10', pv: 7800, uv: 4200 },
  { date: '05-11', pv: 9100, uv: 5000 },
  { date: '05-12', pv: 8500, uv: 4700 },
  { date: '05-13', pv: 10200, uv: 5600 },
  { date: '05-14', pv: 9800, uv: 5300 },
]

const regionData = [
  { name: '广东', value: 18456 },
  { name: '北京', value: 15234 },
  { name: '上海', value: 12890 },
  { name: '浙江', value: 10567 },
  { name: '江苏', value: 9234 },
  { name: '四川', value: 7890 },
  { name: '湖北', value: 6543 },
  { name: '山东', value: 5678 },
]

const osData = [
  { name: 'Windows', value: 45 },
  { name: 'macOS', value: 25 },
  { name: 'Linux', value: 15 },
  { name: 'Android', value: 10 },
  { name: 'iOS', value: 5 },
]

const browserData = [
  { name: 'Chrome', value: 52 },
  { name: 'Safari', value: 18 },
  { name: 'Edge', value: 15 },
  { name: 'Firefox', value: 8 },
  { name: 'Other', value: 7 },
]

const moduleUsageData = [
  { name: '用户管理', count: 2345 },
  { name: '角色管理', count: 1876 },
  { name: '菜单管理', count: 1543 },
  { name: '字典管理', count: 1234 },
  { name: '文件管理', count: 987 },
  { name: '系统配置', count: 876 },
  { name: '日志管理', count: 654 },
  { name: '通知管理', count: 432 },
]

const hourlyData = [
  { hour: '00', visits: 120 },
  { hour: '02', visits: 80 },
  { hour: '04', visits: 45 },
  { hour: '06', visits: 230 },
  { hour: '08', visits: 890 },
  { hour: '10', visits: 1560 },
  { hour: '12', visits: 1230 },
  { hour: '14', visits: 1780 },
  { hour: '16', visits: 1650 },
  { hour: '18', visits: 1340 },
  { hour: '20', visits: 980 },
  { hour: '22', visits: 450 },
]

const PIE_COLORS = [TESLA_COLORS[0], TESLA_COLORS[1], TESLA_COLORS[2], TESLA_COLORS[3], TESLA_COLORS[4]]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-medium text-foreground">分析页</h1>
        <p className="text-sm text-muted-foreground mt-1">系统数据分析与可视化</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-emerald-600">{stat.change} 较上周</p>
                </div>
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${stat.color}14` }}
                >
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts grid – 2 columns x 3 rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Access trend – AreaChart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              访问趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer height={280}>
              <AreaChart data={accessTrendData}>
                <defs>
                  <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TESLA_COLORS[0]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={TESLA_COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="uvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TESLA_COLORS[2]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={TESLA_COLORS[2]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                <YAxis tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                />
                <Legend verticalAlign="top" height={32} iconSize={10} />
                <Area
                  type="monotone"
                  dataKey="pv"
                  name="页面浏览量"
                  stroke={TESLA_COLORS[0]}
                  strokeWidth={2}
                  fill="url(#pvGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="uv"
                  name="独立访客"
                  stroke={TESLA_COLORS[2]}
                  strokeWidth={2}
                  fill="url(#uvGrad)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 2. Region distribution – horizontal BarChart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              地区分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer height={280}>
              <BarChart data={regionData} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="#d0d0d0"
                  width={50}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                />
                <Bar dataKey="value" name="访问量" radius={[0, 4, 4, 0]}>
                  {regionData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? TESLA_COLORS[0] : TESLA_COLORS[0] + '99'} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 3. OS distribution – donut PieChart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              操作系统
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ChartContainer height={240}>
                <PieChart>
                  <Pie
                    data={osData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {osData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => `${v}%`}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                  />
                </PieChart>
              </ChartContainer>
              <div className="space-y-2 text-sm">
                {osData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="ml-auto font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Browser distribution – PieChart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Compass className="h-4 w-4 text-muted-foreground" />
              浏览器分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ChartContainer height={240}>
                <PieChart>
                  <Pie
                    data={browserData}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {browserData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => `${v}%`}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                  />
                </PieChart>
              </ChartContainer>
              <div className="space-y-2 text-sm">
                {browserData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="ml-auto font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Module usage – vertical BarChart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              模块使用
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer height={280}>
              <BarChart data={moduleUsageData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#d0d0d0" />
                <YAxis tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                />
                <Bar dataKey="count" name="调用次数" radius={[4, 4, 0, 0]}>
                  {moduleUsageData.map((_, i) => (
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

        {/* 6. Hourly visits – AreaChart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              访问时段
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer height={280}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TESLA_COLORS[0]} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={TESLA_COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#d0d0d0" tickFormatter={(v) => `${v}:00`} />
                <YAxis tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                <Tooltip
                  labelFormatter={(v) => `${v}:00`}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  name="访问量"
                  stroke={TESLA_COLORS[0]}
                  strokeWidth={2}
                  fill="url(#visitGrad)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
