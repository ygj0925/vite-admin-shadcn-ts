import { FileText, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface ChangelogEntry {
  version: string
  date: string
  tag: string
  changes: { type: 'feature' | 'fix' | 'improve'; text: string }[]
}

const changelog: ChangelogEntry[] = [
  {
    version: 'v4.2.0',
    date: '2026-05-20',
    tag: 'latest',
    changes: [
      { type: 'feature', text: '升级至 React 19 + Tailwind CSS 4' },
      { type: 'feature', text: '引入 Shadcn/ui 组件库' },
      { type: 'feature', text: '全新个人中心页面，支持头像裁剪上传' },
      { type: 'feature', text: '消息中心支持 Tab 切换和批量操作' },
      { type: 'improve', text: '登录页响应式布局优化' },
      { type: 'fix', text: '修复暗色模式下部分组件样式问题' },
    ],
  },
  {
    version: 'v4.1.0',
    date: '2026-03-15',
    tag: '',
    changes: [
      { type: 'feature', text: '新增多租户支持' },
      { type: 'feature', text: '支持邮箱验证码登录' },
      { type: 'improve', text: '优化菜单权限加载性能' },
      { type: 'fix', text: '修复 Token 过期后页面不跳转的问题' },
    ],
  },
  {
    version: 'v4.0.0',
    date: '2026-01-10',
    tag: '',
    changes: [
      { type: 'feature', text: '项目初始化，基于 React 19 重构' },
      { type: 'feature', text: '集成 Zustand 状态管理' },
      { type: 'feature', text: '实现动态路由与权限控制' },
      { type: 'feature', text: '支持多种布局模式切换' },
    ],
  },
]

const changeTypeLabel: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  feature: { label: '新功能', variant: 'default' },
  fix: { label: '修复', variant: 'destructive' },
  improve: { label: '优化', variant: 'secondary' },
}

export default function ChangelogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-foreground">更新日志</h1>
        <p className="text-sm text-muted-foreground mt-1">版本发布记录</p>
      </div>

      <Card className="rounded">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            版本历史
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {changelog.map((entry, idx) => (
            <div key={entry.version}>
              {idx > 0 && <Separator className="my-6" />}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-base font-medium">{entry.version}</h3>
                  {entry.tag && (
                    <Badge variant="outline" className="text-[10px]">
                      {entry.tag}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {entry.date}
                  </span>
                </div>

                <div className="space-y-2 ml-6">
                  {entry.changes.map((change, cidx) => (
                    <div key={cidx} className="flex items-start gap-2">
                      <Badge
                        variant={changeTypeLabel[change.type].variant}
                        className="mt-0.5 shrink-0 text-[10px] px-1.5 py-0"
                      >
                        {changeTypeLabel[change.type].label}
                      </Badge>
                      <span className="text-sm">{change.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
