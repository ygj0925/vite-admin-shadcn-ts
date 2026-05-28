import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Eye, Share2, BookmarkPlus } from 'lucide-react'
import { PageTransition } from '@/components/app/page-transition'
import { GlassCard } from '@/components/app/glass-card'
import { GradientButton } from '@/components/app/gradient-button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Article } from './components/article-card'

const categoryColors: Record<string, string> = {
  '公司新闻': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  '行业动态': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  '技术文章': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  '活动公告': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

const mockArticles: Article[] = [
  {
    id: 1,
    title: 'ContNew v2.3.0 正式发布，全新暗色模式上线',
    excerpt: '本次更新带来了全新的暗色模式、性能优化以及移动端适配等多项重要改进。',
    category: '公司新闻',
    date: '2026-05-28',
    views: 1280,
    gradientFrom: '#3E6AE1',
    gradientTo: '#7C3AED',
  },
  {
    id: 2,
    title: '企业数字化转型的最佳实践与路径',
    excerpt: '深入探讨当前企业数字化转型过程中的关键挑战与解决方案。',
    category: '行业动态',
    date: '2026-05-27',
    views: 960,
    gradientFrom: '#059669',
    gradientTo: '#0D9488',
  },
  {
    id: 3,
    title: 'React 19 新特性详解与迁移指南',
    excerpt: '全面解析 React 19 带来的新特性，包括 Server Components、新 Hook API 等。',
    category: '技术文章',
    date: '2026-05-26',
    views: 2340,
    gradientFrom: '#7C3AED',
    gradientTo: '#EC4899',
  },
  {
    id: 4,
    title: '2026 开发者大会即将开幕',
    excerpt: '一年一度的开发者大会将于 6 月 15 日在线上举行。',
    category: '活动公告',
    date: '2026-05-25',
    views: 1560,
    gradientFrom: '#D97706',
    gradientTo: '#EA580C',
  },
  {
    id: 5,
    title: '插件市场全新上线，生态共建启动',
    excerpt: '全新插件市场正式上线，提供海量插件资源。',
    category: '公司新闻',
    date: '2026-05-24',
    views: 890,
    gradientFrom: '#2563EB',
    gradientTo: '#7C3AED',
  },
  {
    id: 6,
    title: '微服务架构在中大型项目中的落地实践',
    excerpt: '分享微服务架构从设计到落地的完整过程。',
    category: '技术文章',
    date: '2026-05-23',
    views: 1780,
    gradientFrom: '#7C3AED',
    gradientTo: '#2563EB',
  },
  {
    id: 7,
    title: 'AI 驱动的企业智能化升级趋势',
    excerpt: '分析人工智能技术在企业管理中的应用现状与未来趋势。',
    category: '行业动态',
    date: '2026-05-22',
    views: 1120,
    gradientFrom: '#059669',
    gradientTo: '#2563EB',
  },
  {
    id: 8,
    title: '内部技术分享会将于下周举办',
    excerpt: '本季度内部技术分享会将于下周三下午举行。',
    category: '活动公告',
    date: '2026-05-21',
    views: 640,
    gradientFrom: '#EA580C',
    gradientTo: '#D97706',
  },
  {
    id: 9,
    title: 'TypeScript 5.8 高级类型技巧与实战',
    excerpt: '深入讲解 TypeScript 5.8 中的高级类型系统特性。',
    category: '技术文章',
    date: '2026-05-20',
    views: 2100,
    gradientFrom: '#EC4899',
    gradientTo: '#7C3AED',
  },
]

const articleBodies: Record<number, string> = {
  1: `ContNew v2.3.0 正式发布，本次更新带来了多项重要改进：

## 暗色模式
全新的暗色模式现已全面支持，涵盖所有页面和组件。用户可以在设置中自由切换明亮/暗色/跟随系统三种模式。

## 性能优化
- 首屏加载速度提升 40%
- 路由懒加载优化，减少不必要的代码分割
- 图片懒加载与 WebP 自动转换

## 移动端适配
- 全新响应式布局，完美适配手机和平板
- 触摸手势支持
- 底部导航栏（移动端）

## 其他改进
- 新增消息通知中心
- 优化表格组件，支持虚拟滚动
- 修复了 12 个已知问题`,
  2: `数字化转型已成为企业发展的必然趋势。本文将从战略规划、技术选型、组织变革三个维度，深入探讨企业数字化转型的最佳实践。

## 战略规划
明确数字化转型的目标和路径是成功的前提。企业需要从自身业务特点出发，制定切实可行的转型计划。

## 技术选型
云计算、大数据、人工智能是数字化转型的三大技术支柱。选择合适的技术栈至关重要。

## 组织变革
数字化转型不仅是技术变革，更是组织文化的变革。需要培养数字化人才，建立敏捷的组织架构。`,
  3: `React 19 带来了许多令人兴奋的新特性。本文将详细介绍这些特性，并提供从旧版本迁移的完整指南。

## Server Components
服务端组件允许在服务器上渲染组件，减少客户端 JavaScript 包大小。

## 新 Hook API
- use() Hook：支持在渲染过程中读取 Promise 和 Context
- useActionState()：简化表单状态管理
- useFormStatus()：获取表单提交状态

## 迁移步骤
1. 升级 React 和 React DOM 到 19.x
2. 更新 TypeScript 配置
3. 逐步替换已弃用的 API
4. 运行测试验证`,
  4: `2026 开发者大会将于 6 月 15 日正式开幕！

## 大会议程
- 上午：主题演讲 & 技术趋势发布
- 下午：分论坛 & Workshop
- 晚间：社区交流 & After Party

## 亮点话题
- AI 辅助开发的未来
- 前端工程化 2.0
- 云原生架构最佳实践

## 报名方式
本次大会免费线上参与，扫描官方二维码即可报名。名额有限，先到先得！`,
  5: `全新插件市场正式上线！这是一个开放的生态平台，为开发者提供插件发布、分享和安装的一站式服务。

## 主要功能
- 海量插件：涵盖效率工具、数据可视化、自动化等多个领域
- 一键安装：简单配置即可启用插件
- 开发者中心：提供完善的插件开发文档和工具
- 评价体系：用户评分和评论帮助选择优质插件`,
  6: `微服务架构已成为大型系统的主流架构方案。本文将分享从单体架构迁移到微服务架构的完整实践经验。

## 服务拆分策略
按照业务领域进行拆分，遵循单一职责原则。使用领域驱动设计（DDD）方法论指导拆分。

## 通信机制
- 同步通信：RESTful API / gRPC
- 异步通信：消息队列（RabbitMQ / Kafka）

## 部署方案
采用 Kubernetes 进行容器编排，结合 CI/CD 流水线实现自动化部署。`,
  7: `人工智能正在深刻改变企业的运营方式。本文分析了 AI 在企业管理、生产、营销等环节中的应用现状。

## 管理环节
智能决策支持、自动化流程管理、风险预警系统。

## 生产环节
智能质检、预测性维护、生产排程优化。

## 营销环节
精准营销、智能客服、用户行为分析。`,
  8: `本季度内部技术分享会将于下周三下午 2:00 在 3 楼大会议室举行。

## 分享主题
1. 前端工程化实践 - 张三
2. 数据库性能优化 - 李四
3. 容器化部署经验 - 王五

## 时间安排
- 14:00 - 14:40 前端工程化实践
- 14:50 - 15:30 数据库性能优化
- 15:40 - 16:20 容器化部署经验
- 16:20 - 16:40 自由讨论

欢迎全体技术人员参加！`,
  9: `TypeScript 5.8 引入了许多高级类型特性，帮助开发者写出更安全、更优雅的代码。

## 模板字面量类型增强
支持更复杂的字符串模式匹配和推断。

## 条件类型优化
改进了条件类型的可读性和推断能力。

## 实战案例
通过实际项目案例，展示如何利用高级类型特性提升代码质量。`,
}

function getArticleById(id: number): Article | undefined {
  return mockArticles.find((a) => a.id === id)
}

function getArticleBody(id: number): string {
  return articleBodies[id] || mockArticles.find((a) => a.id === id)?.excerpt || '文章内容加载中...'
}

export default function AppInfoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const articleId = Number(id)
  const article = getArticleById(articleId)

  if (!article) {
    return (
      <PageTransition className="p-4 md:p-6">
        <GlassCard className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground">文章不存在</p>
          <GradientButton
            variant="secondary"
            className="mt-4"
            onClick={() => navigate('/app/info')}
          >
            返回资讯列表
          </GradientButton>
        </GlassCard>
      </PageTransition>
    )
  }

  const body = getArticleBody(articleId)

  return (
    <PageTransition className="p-4 md:p-6 space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/app/info')}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回资讯列表
      </button>

      {/* Article header */}
      <GlassCard className="p-0 overflow-hidden">
        {/* Cover gradient */}
        <div
          className="h-48 sm:h-56 md:h-64"
          style={{
            background: `linear-gradient(135deg, ${article.gradientFrom}, ${article.gradientTo})`,
          }}
        />
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              className={categoryColors[article.category] || 'bg-muted text-muted-foreground'}
            >
              {article.category}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {article.date}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              {article.views} 次阅读
            </span>
          </div>
          <h1 className="mt-4 text-xl font-bold leading-tight md:text-2xl">
            {article.title}
          </h1>

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-2">
            <GradientButton variant="secondary" size="sm">
              <BookmarkPlus className="mr-1.5 h-3.5 w-3.5" />
              收藏
            </GradientButton>
            <GradientButton variant="secondary" size="sm">
              <Share2 className="mr-1.5 h-3.5 w-3.5" />
              分享
            </GradientButton>
          </div>
        </div>
      </GlassCard>

      {/* Article body */}
      <GlassCard className="p-6">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {body.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return (
                <h2
                  key={i}
                  className="mt-6 mb-3 text-lg font-semibold"
                >
                  {line.replace('## ', '')}
                </h2>
              )
            }
            if (line.startsWith('- ')) {
              return (
                <li key={i} className="ml-4 text-sm text-muted-foreground">
                  {line.replace('- ', '')}
                </li>
              )
            }
            if (/^\d+\./.test(line)) {
              return (
                <li key={i} className="ml-4 list-decimal text-sm text-muted-foreground">
                  {line.replace(/^\d+\.\s*/, '')}
                </li>
              )
            }
            if (line.trim() === '') {
              return <div key={i} className="h-2" />
            }
            return (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                {line}
              </p>
            )
          })}
        </div>
      </GlassCard>

      <Separator />

      {/* Bottom navigation */}
      <div className="flex justify-center">
        <GradientButton
          variant="secondary"
          onClick={() => navigate('/app/info')}
        >
          返回资讯列表
        </GradientButton>
      </div>
    </PageTransition>
  )
}
