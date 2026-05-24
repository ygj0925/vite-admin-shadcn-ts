import {
  Globe,
  GitFork,
  ExternalLink,
  Package,
  Layers,
  Palette,
  Database,
  FileCode,
  Route,
  Cog,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface TechItem {
  name: string
  description: string
  icon: React.ReactNode
  version?: string
}

const techStack: TechItem[] = [
  {
    name: 'React 19',
    description: '用户界面构建框架',
    icon: <Zap className="h-4 w-4" />,
    version: '^19.0.0',
  },
  {
    name: 'TypeScript',
    description: '类型安全的 JavaScript 超集',
    icon: <FileCode className="h-4 w-4" />,
    version: '^5.7.0',
  },
  {
    name: 'Shadcn/ui',
    description: '可复用的 UI 组件库',
    icon: <Layers className="h-4 w-4" />,
    version: 'latest',
  },
  {
    name: 'Tailwind CSS 4',
    description: '原子化 CSS 框架',
    icon: <Palette className="h-4 w-4" />,
    version: '^4.0.0',
  },
  {
    name: 'Zustand',
    description: '轻量级状态管理库',
    icon: <Database className="h-4 w-4" />,
    version: '^5.0.0',
  },
  {
    name: 'React Router',
    description: '声明式路由管理',
    icon: <Route className="h-4 w-4" />,
    version: '^7.0.0',
  },
  {
    name: 'Axios',
    description: 'Promise 化的 HTTP 客户端',
    icon: <Globe className="h-4 w-4" />,
    version: '^1.7.0',
  },
  {
    name: 'Vite',
    description: '下一代前端构建工具',
    icon: <Cog className="h-4 w-4" />,
    version: '^6.0.0',
  },
]

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-foreground">关于</h1>
        <p className="text-sm text-muted-foreground mt-1">
          系统信息与技术栈
        </p>
      </div>

      {/* App Info Card */}
      <Card className="rounded">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            应用信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">应用名称</p>
              <p className="text-sm font-medium">ContiNew Admin</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">版本号</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">v4.2.0</Badge>
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground mb-1">项目描述</p>
              <p className="text-sm text-foreground">
                ContiNew Admin 是一套持续迭代升级的后台管理系统前端解决方案，基于
                React 19 + TypeScript + Shadcn/ui +
                Tailwind CSS 构建，开箱即用，助力快速开发。
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex items-center gap-3">
            <a
              href="https://gitee.com/continew/continew-admin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <Globe className="h-4 w-4" />
              Gitee
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
            <a
              href="https://github.com/continew/continew-admin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <GitFork className="h-4 w-4" />
              GitHub
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack Card */}
      <Card className="rounded">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" />
            技术栈
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {techStack.map((item) => (
              <div
                key={item.name}
                className="flex items-start gap-3 rounded-md border p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.version && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {item.version}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
