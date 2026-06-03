import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart3, Layers, Clock, AlertTriangle, Package, TrendingUp } from 'lucide-react'

const PROJECTS = [
  { name: '项目排期系统', phase: '开发中', status: 'in_progress', progress: 65, members: ['张三', '李四', '王五'], startDate: '2026-04-01', endDate: '2026-08-30' },
  { name: '会议室预约系统', phase: '测试中', status: 'testing', progress: 85, members: ['赵六', '钱七'], startDate: '2026-03-15', endDate: '2026-06-30' },
  { name: '数据看板平台', phase: '规划中', status: 'planned', progress: 10, members: ['孙八'], startDate: '2026-06-01', endDate: '2026-10-31' },
  { name: '移动端 App', phase: '已上线', status: 'completed', progress: 100, members: ['周九', '吴十', '郑一'], startDate: '2026-01-01', endDate: '2026-04-30' },
  { name: '微服务架构改造', phase: '有风险', status: 'at_risk', progress: 40, members: ['王二', '李三'], startDate: '2026-02-01', endDate: '2026-07-31' },
  { name: 'AI 智能助手', phase: '开发中', status: 'in_progress', progress: 30, members: ['张四', '赵五', '钱六'], startDate: '2026-05-01', endDate: '2026-12-31' },
]

const RISKS = [
  { project: '微服务架构改造', level: 'high', desc: '技术方案变更导致延期风险' },
  { project: '数据看板平台', level: 'medium', desc: '需求尚未完全确认' },
  { project: 'AI 智能助手', level: 'low', desc: '依赖外部 API 稳定性' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  in_progress: { label: '开发中', color: 'bg-blue-100 text-blue-700' },
  testing: { label: '测试中', color: 'bg-purple-100 text-purple-700' },
  planned: { label: '规划中', color: 'bg-gray-100 text-gray-700' },
  completed: { label: '已上线', color: 'bg-green-100 text-green-700' },
  at_risk: { label: '有风险', color: 'bg-red-100 text-red-700' },
}

const RISK_COLORS: Record<string, string> = {
  high: 'border-l-red-500 bg-red-50 dark:bg-red-950/20',
  medium: 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20',
  low: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
}

export default function ProjectSchedulePage() {
  const stats = [
    { label: '总项目', value: PROJECTS.length, icon: Layers, color: 'text-blue-500' },
    { label: '进行中', value: PROJECTS.filter((p) => p.status === 'in_progress' || p.status === 'testing').length, icon: Clock, color: 'text-blue-500' },
    { label: '规划中', value: PROJECTS.filter((p) => p.status === 'planned').length, icon: BarChart3, color: 'text-gray-500' },
    { label: '有风险', value: PROJECTS.filter((p) => p.status === 'at_risk').length, icon: AlertTriangle, color: 'text-red-500' },
    { label: '已上线', value: PROJECTS.filter((p) => p.status === 'completed').length, icon: Package, color: 'text-green-500' },
    { label: '本月交付', value: 2, icon: TrendingUp, color: 'text-purple-500' },
  ]

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 项目总览表 */}
      <Card>
        <CardHeader><CardTitle>项目总览</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">项目名称</th>
                  <th className="pb-3 font-medium">阶段</th>
                  <th className="pb-3 font-medium">进度</th>
                  <th className="pb-3 font-medium">成员</th>
                  <th className="pb-3 font-medium">时间</th>
                </tr>
              </thead>
              <tbody>
                {PROJECTS.map((p) => {
                  const cfg = STATUS_CONFIG[p.status]
                  return (
                    <tr key={p.name} className="border-b last:border-0">
                      <td className="py-3 font-medium">{p.name}</td>
                      <td className="py-3"><Badge className={cfg?.color}>{p.phase}</Badge></td>
                      <td className="py-3 w-40"><div className="flex items-center gap-2"><Progress value={p.progress} className="h-2 flex-1" /><span className="text-xs text-muted-foreground w-8">{p.progress}%</span></div></td>
                      <td className="py-3"><div className="flex gap-1 flex-wrap">{p.members.map((m) => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}</div></td>
                      <td className="py-3 text-xs text-muted-foreground">{p.startDate} ~ {p.endDate}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 底部：甘特图 + 风险面板 */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* 甘特图（简化版） */}
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>项目排期甘特图</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PROJECTS.map((p) => {
                const start = new Date(p.startDate).getTime()
                const end = new Date(p.endDate).getTime()
                const now = Date.now()
                const totalSpan = end - start
                const elapsedSpan = Math.min(now - start, totalSpan)
                const elapsedPct = totalSpan > 0 ? (elapsedSpan / totalSpan) * 100 : 0
                return (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 truncate text-sm font-medium">{p.name}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden relative">
                      <div className="absolute inset-y-0 left-0 bg-primary/20 rounded-full" style={{ width: `${elapsedPct}%` }} />
                      <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="w-10 text-xs text-muted-foreground text-right">{p.progress}%</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>2026-01</span><span>2026-04</span><span>2026-07</span><span>2026-10</span><span>2026-12</span>
            </div>
          </CardContent>
        </Card>

        {/* 风险面板 */}
        <Card>
          <CardHeader><CardTitle>风险事项</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {RISKS.map((r, i) => (
              <div key={i} className={`border-l-4 rounded-r-md p-3 ${RISK_COLORS[r.level]}`}>
                <p className="text-sm font-medium">{r.project}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                <Badge variant="outline" className="mt-2 text-[10px]">
                  {r.level === 'high' ? '高风险' : r.level === 'medium' ? '中风险' : '低风险'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
