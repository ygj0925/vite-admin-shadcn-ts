import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  FileText,
  Bell,
  Calendar,
  BarChart3,
  Shield,
  Settings,
  MessageSquare,
  TrendingUp,
  Clock,
  ExternalLink,
  GitBranch,
  BookOpen,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUserStore } from '@/stores/user'
import { getDashboardNotice, type DashboardNotice } from '@/apis/common/dashboard'
import { PageTransition } from '@/components/app/page-transition'
import { GlassCard } from '@/components/app/glass-card'
import { StatCard } from '@/components/app/stat-card'
import { AppIcon } from '@/components/app/app-icon'

const TESLA_BLUE = '#3E6AE1'

const quotes = [
  '每一个不曾起舞的日子，都是对生命的辜负。',
  '代码改变世界，你改变代码。',
  '今天也要元气满满地写 Bug 呢！',
  '保持热爱，奔赴山海。',
  'Less is more, but simpler is better.',
]

const stats = [
  {
    title: '总访问量',
    value: '128,430',
    trend: { value: '+12.5%', positive: true },
    icon: <BarChart3 className="h-5 w-5 text-white" />,
    iconColor: 'from-violet-600 to-blue-600',
  },
  {
    title: '今日访问',
    value: '1,280',
    trend: { value: '+8.2%', positive: true },
    icon: <TrendingUp className="h-5 w-5 text-white" />,
    iconColor: 'from-emerald-500 to-teal-500',
  },
  {
    title: '活跃用户',
    value: '326',
    trend: { value: '+3.1%', positive: true },
    icon: <Users className="h-5 w-5 text-white" />,
    iconColor: 'from-amber-500 to-orange-500',
  },
  {
    title: '待处理任务',
    value: '12',
    trend: { value: '-2', positive: false },
    icon: <Bell className="h-5 w-5 text-white" />,
    iconColor: 'from-rose-500 to-pink-500',
  },
]

const quickApps = [
  { label: 'AI 助手', icon: <MessageSquare className="h-6 w-6 text-white" />, path: '/app/ai-chat', color: 'from-blue-500 to-cyan-500' },
  { label: '日程管理', icon: <Calendar className="h-6 w-6 text-white" />, path: '/app/schedule', color: 'from-emerald-500 to-green-500' },
  { label: '企业信息', icon: <FileText className="h-6 w-6 text-white" />, path: '/app/info', color: 'from-violet-500 to-purple-500' },
  { label: '用户管理', icon: <Shield className="h-6 w-6 text-white" />, path: '/system/user', color: 'from-amber-500 to-orange-500' },
  { label: '系统设置', icon: <Settings className="h-6 w-6 text-white" />, path: '/app/settings', color: 'from-slate-500 to-gray-500' },
  { label: '消息通知', icon: <Bell className="h-6 w-6 text-white" />, path: '/app/home', color: 'from-rose-500 to-pink-500' },
]

const activities = [
  { user: '张三', action: '提交了代码', target: 'feat: 新增用户导出功能', time: '10 分钟前', avatar: '张' },
  { user: '李四', action: '创建了任务', target: '优化查询性能', time: '30 分钟前', avatar: '李' },
  { user: '王五', action: '合并了分支', target: 'feature/export → main', time: '1 小时前', avatar: '王' },
  { user: '赵六', action: '发布了版本', target: 'v2.3.0', time: '2 小时前', avatar: '赵' },
  { user: '钱七', action: '关闭了问题', target: '#234 登录页面样式异常', time: '3 小时前', avatar: '钱' },
]

const carouselItems = [
  { title: 'ContNew v2.3.0 正式发布', desc: '全新暗色模式、性能优化、移动端适配', color: TESLA_BLUE },
  { title: '开发者大会 2026', desc: '6 月 15 日，线上直播，免费报名', color: '#171A20' },
  { title: '插件市场全新上线', desc: '海量插件，一键安装，生态共建', color: '#5C5E62' },
]

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

export default function AppHome() {
  const navigate = useNavigate()
  const userInfo = useUserStore((s) => s.userInfo)
  const nickname = userInfo?.nickname || userInfo?.username || '用户'
  const greeting = getGreeting()
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])

  const [notices, setNotices] = useState<DashboardNotice[]>([])
  const [carouselIndex, setCarouselIndex] = useState(0)

  useEffect(() => {
    getDashboardNotice()
      .then((res) => setNotices(res.data || []))
      .catch(() => {})
  }, [])

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselItems.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const noticeTypeLabel = (type: number) => {
    switch (type) {
      case 1: return '通知'
      case 2: return '公告'
      default: return '消息'
    }
  }

  return (
    <PageTransition className="p-4 md:p-6 space-y-6">
      {/* Welcome banner */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ backgroundColor: TESLA_BLUE }}
          >
            {nickname.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-medium text-foreground">
              {greeting}，{nickname}，祝你开心每一天！
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{quote}</p>
          </div>
        </div>
      </GlassCard>

      {/* Statistics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      {/* Quick apps */}
      <GlassCard title="常用应用">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickApps.map((app) => (
            <AppIcon
              key={app.label}
              icon={app.icon}
              label={app.label}
              color={app.color}
              onClick={() => navigate(app.path)}
            />
          ))}
        </div>
      </GlassCard>

      {/* Two-column layout: Activities + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Recent activities */}
          <GlassCard title="最新动态">
            <ScrollArea className="max-h-80">
              <div className="space-y-0">
                {activities.map((a, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-3 py-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: TESLA_BLUE + 'cc' }}
                      >
                        {a.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{a.user}</span>
                          <span className="text-muted-foreground"> {a.action} </span>
                          <span className="text-foreground">{a.target}</span>
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {a.time}
                        </p>
                      </div>
                    </div>
                    {i < activities.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </GlassCard>

          {/* Carousel placeholder */}
          <GlassCard className="p-0 overflow-hidden">
            <div
              className="relative flex h-40 flex-col items-center justify-center text-white transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${carouselItems[carouselIndex].color}, ${TESLA_BLUE}88)`,
              }}
            >
              <p className="text-base font-medium">{carouselItems[carouselIndex].title}</p>
              <p className="mt-1 text-sm opacity-80">{carouselItems[carouselIndex].desc}</p>
              <div className="absolute bottom-3 flex gap-1.5">
                {carouselItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === carouselIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Notices */}
          <GlassCard title="最近通知">
            <ScrollArea className="max-h-72">
              <div className="space-y-0">
                {notices.length > 0 ? notices.map((n, i) => (
                  <div key={n.id}>
                    <div className="flex items-start justify-between gap-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                              n.type === 2
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {noticeTypeLabel(n.type)}
                          </span>
                          <span className="text-sm truncate">{n.title}</span>
                        </div>
                      </div>
                    </div>
                    {i < notices.length - 1 && <Separator />}
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">暂无通知</p>
                )}
              </div>
            </ScrollArea>
          </GlassCard>

          {/* Documentation links */}
          <GlassCard title="文档资源">
            <div className="space-y-2">
              {[
                { label: 'API 接口文档', icon: FileText, href: '/api-docs' },
                { label: '更新日志', icon: GitBranch, href: '/changelog' },
                { label: '使用指南', icon: BookOpen, href: '/guide' },
              ].map((doc) => (
                <a
                  key={doc.label}
                  href={doc.href}
                  className="flex items-center justify-between rounded-lg p-2.5 text-sm transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-2.5">
                    <doc.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{doc.label}</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  )
}
