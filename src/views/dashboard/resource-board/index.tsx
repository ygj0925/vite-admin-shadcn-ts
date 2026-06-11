import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, Activity, AlertTriangle, UserX, TrendingUp, BarChart3 } from 'lucide-react'

const MEMBERS = [
  { name: '张三', load: 85, status: 'normal', projects: ['项目排期系统', '会议室预约系统'] },
  { name: '李四', load: 120, status: 'overloaded', projects: ['项目排期系统', '微服务架构改造', 'AI 智能助手'] },
  { name: '王五', load: 60, status: 'underutilized', projects: ['项目排期系统'] },
  { name: '赵六', load: 95, status: 'normal', projects: ['会议室预约系统', '数据看板平台'] },
  { name: '钱七', load: 40, status: 'underutilized', projects: ['会议室预约系统'] },
  { name: '孙八', load: 0, status: 'idle', projects: [] },
  { name: '周九', load: 110, status: 'overloaded', projects: ['移动端 App', 'AI 智能助手', '微服务架构改造'] },
  { name: '吴十', load: 75, status: 'normal', projects: ['移动端 App'] },
  { name: '郑一', load: 50, status: 'underutilized', projects: ['移动端 App'] },
  { name: '王二', load: 130, status: 'overloaded', projects: ['微服务架构改造', 'AI 智能助手', '数据看板平台'] },
]

const LOAD_STATUS: Record<string, { label: string; color: string; progressColor: string }> = {
  normal: { label: '正常', color: 'bg-green-100 text-green-700', progressColor: '' },
  overloaded: { label: '超负荷', color: 'bg-red-100 text-red-700', progressColor: '[&>div]:bg-red-500' },
  underutilized: { label: '未饱和', color: 'bg-yellow-100 text-yellow-700', progressColor: '[&>div]:bg-yellow-500' },
  idle: { label: '空闲', color: 'bg-gray-100 text-gray-700', progressColor: '[&>div]:bg-gray-400' },
}

const RISKS = [
  { type: 'overloaded', members: ['李四', '周九', '王二'], desc: '负荷超过 100%，需要调整任务分配' },
  { type: 'underutilized', members: ['王五', '钱七', '郑一'], desc: '负荷低于 60%，可承担更多任务' },
  { type: 'idle', members: ['孙八'], desc: '当前无任务分配，需确认是否休假' },
]

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  overloaded: { label: '超负荷风险', color: 'border-l-red-500 bg-red-50 dark:bg-red-950/20' },
  underutilized: { label: '资源闲置', color: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' },
  idle: { label: '人员空闲', color: 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20' },
}

export default function ResourceBoardPage() {
  const avgLoad = Math.round(MEMBERS.reduce((sum, m) => sum + m.load, 0) / MEMBERS.length)
  const stats = [
    { label: '总人数', value: MEMBERS.length, icon: Users, color: 'text-blue-500' },
    { label: '平均负荷', value: `${avgLoad}%`, icon: Activity, color: 'text-blue-500' },
    { label: '超负荷', value: MEMBERS.filter((m) => m.status === 'overloaded').length, icon: AlertTriangle, color: 'text-red-500' },
    { label: '未饱和', value: MEMBERS.filter((m) => m.status === 'underutilized').length, icon: BarChart3, color: 'text-yellow-500' },
    { label: '空闲', value: MEMBERS.filter((m) => m.status === 'idle').length, icon: UserX, color: 'text-gray-500' },
    { label: '正常', value: MEMBERS.filter((m) => m.status === 'normal').length, icon: TrendingUp, color: 'text-green-500' },
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

      {/* 人员负荷表 */}
      <Card>
        <CardHeader><CardTitle>人员负荷明细</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">成员</th>
                  <th className="pb-3 font-medium">负荷</th>
                  <th className="pb-3 font-medium">状态</th>
                  <th className="pb-3 font-medium">参与项目</th>
                </tr>
              </thead>
              <tbody>
                {MEMBERS.map((m) => {
                  const cfg = LOAD_STATUS[m.status]
                  return (
                    <tr key={m.name} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{m.name[0]}</AvatarFallback></Avatar>
                          <span className="font-medium">{m.name}</span>
                        </div>
                      </td>
                      <td className="py-3 w-48">
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(m.load, 100)} className={`h-2 flex-1 ${cfg?.progressColor}`} />
                          <span className={`text-xs font-medium w-10 ${m.load > 100 ? 'text-red-500' : 'text-muted-foreground'}`}>{m.load}%</span>
                        </div>
                      </td>
                      <td className="py-3"><Badge className={cfg?.color}>{cfg?.label}</Badge></td>
                      <td className="py-3">
                        <div className="flex gap-1 flex-wrap">
                          {m.projects.length > 0
                            ? m.projects.map((p) => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)
                            : <span className="text-xs text-muted-foreground">无</span>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 底部：负荷甘特图 + 风险面板 */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* 负荷甘特图（简化版） */}
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>资源负荷甘特图</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MEMBERS.map((m) => {
                return (
                  <div key={m.name} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-sm font-medium">{m.name}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden relative">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full ${
                          m.status === 'overloaded' ? 'bg-red-500' :
                          m.status === 'underutilized' ? 'bg-yellow-500' :
                          m.status === 'idle' ? 'bg-gray-400' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(m.load, 100)}%` }}
                      />
                    </div>
                    <span className={`w-10 text-xs text-right font-medium ${m.load > 100 ? 'text-red-500' : 'text-muted-foreground'}`}>{m.load}%</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 风险面板 */}
        <Card>
          <CardHeader><CardTitle>资源风险</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {RISKS.map((r, i) => {
              const cfg = RISK_LABELS[r.type]
              return (
                <div key={i} className={`border-l-4 rounded-r-md p-3 ${cfg?.color}`}>
                  <p className="text-sm font-medium">{cfg?.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {r.members.map((m) => <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>)}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
