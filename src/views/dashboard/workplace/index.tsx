import {
  Users,
  Shield,
  Menu,
  BookOpen,
  FolderOpen,
  Settings,
  Bell,
  Star,
  Activity,
  ExternalLink,
  FileText,
  GitBranch,
  ChevronRight,
  Clock,
  Quote,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUserStore } from '@/stores/user'

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const quotes = [
  '每一个不曾起舞的日子，都是对生命的辜负。',
  '代码改变世界，你改变代码。',
  '今天也要元气满满地写 Bug 呢！',
  '保持热爱，奔赴山海。',
  'Less is more, but simpler is better.',
]

const projects = [
  { name: 'ContNew Admin', desc: '后台管理系统前端', status: 'active', stars: 128 },
  { name: 'ContNew API', desc: 'RESTful API 服务端', status: 'active', stars: 96 },
  { name: 'ContNew Mobile', desc: '移动端 H5 应用', status: 'dev', stars: 42 },
  { name: 'ContNew Docs', desc: '项目文档中心', status: 'active', stars: 35 },
  { name: 'ContNew CLI', desc: '命令行开发工具', status: 'dev', stars: 18 },
  { name: 'ContNew Plugin', desc: '插件扩展市场', status: 'planning', stars: 7 },
]

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  active: { label: '运行中', variant: 'default' },
  dev: { label: '开发中', variant: 'secondary' },
  planning: { label: '规划中', variant: 'outline' },
}

const activities = [
  { user: '张三', action: '提交了代码', target: 'feat: 新增用户导出功能', time: '10 分钟前', avatar: '张' },
  { user: '李四', action: '创建了任务', target: '优化查询性能', time: '30 分钟前', avatar: '李' },
  { user: '王五', action: '合并了分支', target: 'feature/export → main', time: '1 小时前', avatar: '王' },
  { user: '赵六', action: '发布了版本', target: 'v2.3.0', time: '2 小时前', avatar: '赵' },
  { user: '钱七', action: '关闭了问题', target: '#234 登录页面样式异常', time: '3 小时前', avatar: '钱' },
]

const quickLinks = [
  { label: '用户管理', icon: Users, path: '/system/user', permission: 'system:user:list' },
  { label: '角色管理', icon: Shield, path: '/system/role', permission: 'system:role:list' },
  { label: '菜单管理', icon: Menu, path: '/system/menu', permission: 'system:menu:list' },
  { label: '字典管理', icon: BookOpen, path: '/system/dict', permission: 'system:dict:list' },
  { label: '文件管理', icon: FolderOpen, path: '/system/file', permission: 'system:file:list' },
  { label: '系统配置', icon: Settings, path: '/system/config', permission: 'system:config:list' },
]

const notices = [
  { id: 1, title: '系统将于本周六凌晨 2:00 进行维护升级', time: '2 小时前', type: '通知' },
  { id: 2, title: 'v2.3.0 版本已发布，包含多项功能优化', time: '1 天前', type: '公告' },
  { id: 3, title: '请各部门尽快完成年度数据备份工作', time: '2 天前', type: '通知' },
  { id: 4, title: '新功能上线：支持批量导入用户数据', time: '3 天前', type: '公告' },
  { id: 5, title: '安全提醒：请定期更换系统密码', time: '5 天前', type: '通知' },
]

const carouselItems = [
  { title: 'ContNew v2.3.0 正式发布', desc: '全新暗色模式、性能优化、移动端适配', color: TESLA_BLUE },
  { title: '开发者大会 2026', desc: '6 月 15 日，线上直播，免费报名', color: '#171A20' },
  { title: '插件市场全新上线', desc: '海量插件，一键安装，生态共建', color: '#5C5E62' },
]

const TESLA_BLUE = '#3E6AE1'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WorkplacePage() {
  const userInfo = useUserStore((s) => s.userInfo)
  const permissions = useUserStore((s) => s.permissions)
  const nickname = userInfo?.nickname || userInfo?.username || '用户'
  const greeting = getGreeting()
  const quote = quotes[Math.floor(Math.random() * quotes.length)]

  const hasPermission = (perm: string) =>
    permissions.includes('*:*:*') || permissions.includes(perm)

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------- */}
      {/*  Welcome banner                                                 */}
      {/* -------------------------------------------------------------- */}
      <Card>
        <CardContent className="p-6">
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
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Quote className="h-3.5 w-3.5 shrink-0" />
                {quote}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------- */}
      {/*  Two-column layout                                              */}
      {/* -------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Project cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">我的项目</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {projects.map((p) => {
                  const st = statusMap[p.status]
                  return (
                    <div
                      key={p.name}
                      className="group flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:border-[--t-blue]"
                      style={{ '--t-blue': TESLA_BLUE } as React.CSSProperties}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{p.name}</span>
                        <Badge variant={st.variant} className="text-[10px] px-1.5 h-4">
                          {st.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.desc}</p>
                      <div className="mt-auto flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        <span>{p.stars}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Latest activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                最新动态
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Quick operations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">快捷操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {quickLinks.map((link) => {
                  const allowed = hasPermission(link.permission)
                  return (
                    <a
                      key={link.label}
                      href={allowed ? link.path : undefined}
                      className={`group flex flex-col items-center gap-2 rounded-lg p-3 text-center transition-colors ${
                        allowed
                          ? 'hover:bg-muted cursor-pointer'
                          : 'opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: TESLA_BLUE + '14' }}
                      >
                        <link.icon className="h-5 w-5" style={{ color: TESLA_BLUE }} />
                      </div>
                      <span className="text-xs text-foreground">{link.label}</span>
                    </a>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Notices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                最近通知
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-72">
                <div className="space-y-0">
                  {notices.map((n, i) => (
                    <div key={n.id}>
                      <div className="flex items-start justify-between gap-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={n.type === '公告' ? 'default' : 'secondary'}
                              className="text-[10px] px-1.5 h-4"
                            >
                              {n.type}
                            </Badge>
                            <span className="text-sm truncate">{n.title}</span>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                          {n.time}
                        </span>
                      </div>
                      {i < notices.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Carousel placeholder */}
          <Card>
            <CardContent className="p-0">
              <div
                className="relative flex h-40 flex-col items-center justify-center rounded-xl text-white"
                style={{ background: `linear-gradient(135deg, ${carouselItems[0].color}, ${TESLA_BLUE}88)` }}
              >
                <p className="text-base font-medium">{carouselItems[0].title}</p>
                <p className="mt-1 text-sm opacity-80">{carouselItems[0].desc}</p>
                {/* Dot indicators */}
                <div className="absolute bottom-3 flex gap-1.5">
                  {carouselItems.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === 0 ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentation links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">文档资源</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
