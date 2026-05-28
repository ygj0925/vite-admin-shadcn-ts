import { useState, useEffect } from 'react'
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
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, TESLA_COLORS } from '@/components/chart'
import {
  getDashboardOverviewPv,
  getDashboardOverviewIp,
  getAccessTrend,
  getAnalysisGeo,
  getAnalysisOs,
  getAnalysisBrowser,
  getAnalysisModule,
  getAnalysisTimeslot,
  type DashboardOverview,
  type DashboardAccessTrend,
  type DashboardChartItem,
} from '@/apis/common/dashboard'

const PIE_COLORS = [TESLA_COLORS[0], TESLA_COLORS[1], TESLA_COLORS[2], TESLA_COLORS[3], TESLA_COLORS[4]]

export default function AnalysisPage() {
  const [pvOverview, setPvOverview] = useState<DashboardOverview | null>(null)
  const [ipOverview, setIpOverview] = useState<DashboardOverview | null>(null)
  const [accessTrend, setAccessTrend] = useState<DashboardAccessTrend[]>([])
  const [geoData, setGeoData] = useState<DashboardChartItem[]>([])
  const [osData, setOsData] = useState<DashboardChartItem[]>([])
  const [browserData, setBrowserData] = useState<DashboardChartItem[]>([])
  const [moduleData, setModuleData] = useState<DashboardChartItem[]>([])
  const [timeslotData, setTimeslotData] = useState<DashboardChartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      try {
        const [pv, ip, trend, geo, os, browser, module, timeslot] = await Promise.allSettled([
          getDashboardOverviewPv(),
          getDashboardOverviewIp(),
          getAccessTrend(7),
          getAnalysisGeo(),
          getAnalysisOs(),
          getAnalysisBrowser(),
          getAnalysisModule(),
          getAnalysisTimeslot(),
        ])
        if (pv.status === 'fulfilled') setPvOverview(pv.value.data)
        if (ip.status === 'fulfilled') setIpOverview(ip.value.data)
        if (trend.status === 'fulfilled') setAccessTrend(trend.value.data || [])
        if (geo.status === 'fulfilled') setGeoData(geo.value.data || [])
        if (os.status === 'fulfilled') setOsData(os.value.data || [])
        if (browser.status === 'fulfilled') setBrowserData(browser.value.data || [])
        if (module.status === 'fulfilled') setModuleData(module.value.data || [])
        if (timeslot.status === 'fulfilled') setTimeslotData(timeslot.value.data || [])
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-foreground">分析页</h1>
        <p className="text-sm text-muted-foreground mt-1">系统数据分析与可视化</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard title="页面浏览量 (PV)" overview={pvOverview} icon={Eye} color={TESLA_COLORS[0]} />
        <OverviewCard title="独立访客 (IP)" overview={ipOverview} icon={Wifi} color={TESLA_COLORS[1]} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Access trend */}
        {accessTrend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                访问趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer height={280}>
                <AreaChart data={accessTrend}>
                  <defs>
                    <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TESLA_COLORS[0]} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={TESLA_COLORS[0]} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ipGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TESLA_COLORS[2]} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={TESLA_COLORS[2]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }} />
                  <Legend verticalAlign="top" height={32} iconSize={10} />
                  <Area type="monotone" dataKey="pvCount" name="PV" stroke={TESLA_COLORS[0]} strokeWidth={2} fill="url(#pvGrad)" />
                  <Area type="monotone" dataKey="ipCount" name="IP" stroke={TESLA_COLORS[2]} strokeWidth={2} fill="url(#ipGrad)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* 2. Region distribution */}
        {geoData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                地区分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer height={280}>
                <BarChart data={geoData.slice(0, 10)} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#d0d0d0" width={50} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }} />
                  <Bar dataKey="value" name="访问量" radius={[0, 4, 4, 0]}>
                    {geoData.slice(0, 10).map((_, i) => (
                      <Cell key={i} fill={i === 0 ? TESLA_COLORS[0] : TESLA_COLORS[0] + '99'} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* 3. OS distribution */}
        {osData.length > 0 && (
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
                    <Pie data={osData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" stroke="none">
                      {osData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }} />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2 text-sm">
                  {osData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="ml-auto font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4. Browser distribution */}
        {browserData.length > 0 && (
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
                    <Pie data={browserData} cx="50%" cy="50%" outerRadius={95} paddingAngle={2} dataKey="value" stroke="none"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {browserData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }} />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2 text-sm">
                  {browserData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="ml-auto font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 5. Module usage */}
        {moduleData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                模块使用
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer height={280}>
                <BarChart data={moduleData.slice(0, 10)} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#d0d0d0" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }} />
                  <Bar dataKey="value" name="调用次数" radius={[4, 4, 0, 0]}>
                    {moduleData.slice(0, 10).map((_, i) => (
                      <Cell key={i} fill={i === 0 ? TESLA_COLORS[0] : TESLA_COLORS[0] + (i % 2 === 0 ? 'cc' : '99')} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* 6. Hourly visits */}
        {timeslotData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                访问时段
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer height={280}>
                <AreaChart data={timeslotData}>
                  <defs>
                    <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TESLA_COLORS[0]} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={TESLA_COLORS[0]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#d0d0d0" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5', fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" name="访问量" stroke={TESLA_COLORS[0]} strokeWidth={2} fill="url(#visitGrad)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function OverviewCard({ title, overview, icon: Icon, color }: {
  title: string
  overview: DashboardOverview | null
  icon: React.ElementType
  color: string
}) {
  if (!overview) return null
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{overview.total.toLocaleString()}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">今日 {overview.today.toLocaleString()}</span>
              {overview.growth !== 0 && (
                <span className={overview.growth > 0 ? 'text-emerald-600' : 'text-red-500'}>
                  {overview.growth > 0 ? '+' : ''}{(overview.growth * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}14` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
        {overview.dataList.length > 0 && (
          <div className="mt-3 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview.dataList}>
                <defs>
                  <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#spark-${title})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
