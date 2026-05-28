import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageTransition } from '@/components/app/page-transition'
import { GlassCard } from '@/components/app/glass-card'
import { Carousel } from './components/carousel'
import { ArticleCard, type Article } from './components/article-card'

const categories = ['全部', '公司新闻', '行业动态', '技术文章', '活动公告'] as const

const mockArticles: Article[] = [
  {
    id: 1,
    title: 'ContNew v2.3.0 正式发布，全新暗色模式上线',
    excerpt: '本次更新带来了全新的暗色模式、性能优化以及移动端适配等多项重要改进，为用户带来更优质的使用体验。',
    category: '公司新闻',
    date: '2026-05-28',
    views: 1280,
    gradientFrom: '#3E6AE1',
    gradientTo: '#7C3AED',
  },
  {
    id: 2,
    title: '企业数字化转型的最佳实践与路径',
    excerpt: '深入探讨当前企业数字化转型过程中的关键挑战与解决方案，助力企业实现高效转型。',
    category: '行业动态',
    date: '2026-05-27',
    views: 960,
    gradientFrom: '#059669',
    gradientTo: '#0D9488',
  },
  {
    id: 3,
    title: 'React 19 新特性详解与迁移指南',
    excerpt: '全面解析 React 19 带来的新特性，包括 Server Components、新 Hook API 等，并提供从旧版本迁移的详细步骤。',
    category: '技术文章',
    date: '2026-05-26',
    views: 2340,
    gradientFrom: '#7C3AED',
    gradientTo: '#EC4899',
  },
  {
    id: 4,
    title: '2026 开发者大会即将开幕',
    excerpt: '一年一度的开发者大会将于 6 月 15 日在线上举行，届时将有众多技术专家分享前沿技术话题，欢迎报名参加。',
    category: '活动公告',
    date: '2026-05-25',
    views: 1560,
    gradientFrom: '#D97706',
    gradientTo: '#EA580C',
  },
  {
    id: 5,
    title: '插件市场全新上线，生态共建启动',
    excerpt: '全新插件市场正式上线，提供海量插件资源，支持一键安装，欢迎开发者参与生态共建。',
    category: '公司新闻',
    date: '2026-05-24',
    views: 890,
    gradientFrom: '#2563EB',
    gradientTo: '#7C3AED',
  },
  {
    id: 6,
    title: '微服务架构在中大型项目中的落地实践',
    excerpt: '分享微服务架构从设计到落地的完整过程，包括服务拆分策略、通信机制、部署方案等关键环节。',
    category: '技术文章',
    date: '2026-05-23',
    views: 1780,
    gradientFrom: '#7C3AED',
    gradientTo: '#2563EB',
  },
  {
    id: 7,
    title: 'AI 驱动的企业智能化升级趋势',
    excerpt: '分析人工智能技术在企业管理、生产、营销等环节中的应用现状与未来趋势。',
    category: '行业动态',
    date: '2026-05-22',
    views: 1120,
    gradientFrom: '#059669',
    gradientTo: '#2563EB',
  },
  {
    id: 8,
    title: '内部技术分享会将于下周举办',
    excerpt: '本季度内部技术分享会将于下周三下午举行，主题涵盖前端工程化、数据库优化等热门话题。',
    category: '活动公告',
    date: '2026-05-21',
    views: 640,
    gradientFrom: '#EA580C',
    gradientTo: '#D97706',
  },
  {
    id: 9,
    title: 'TypeScript 5.8 高级类型技巧与实战',
    excerpt: '深入讲解 TypeScript 5.8 中的高级类型系统特性，通过实际案例帮助开发者写出更安全、更优雅的代码。',
    category: '技术文章',
    date: '2026-05-20',
    views: 2100,
    gradientFrom: '#EC4899',
    gradientTo: '#7C3AED',
  },
]

export default function AppInfo() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')

  const filteredArticles = useMemo(() => {
    return mockArticles.filter((article) => {
      const matchesCategory =
        activeCategory === '全部' || article.category === activeCategory
      const matchesSearch =
        !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  const featuredArticles = useMemo(() => {
    return mockArticles.filter((a) => a.views > 1000).slice(0, 4)
  }, [])

  const handleArticleClick = (article: Article) => {
    navigate(`/app/info/${article.id}`)
  }

  return (
    <PageTransition className="p-4 md:p-6 space-y-6">
      {/* Search bar */}
      <GlassCard className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索资讯..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-10 bg-background/50"
          />
        </div>
      </GlassCard>

      {/* Category tabs + Carousel */}
      <div className="space-y-4">
        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
        >
          <GlassCard className="p-3">
            <TabsList variant="line" className="w-full justify-start">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </GlassCard>

          {/* Featured carousel - visible on "全部" tab */}
          {activeCategory === '全部' && (
            <Carousel
              articles={featuredArticles}
              onArticleClick={handleArticleClick}
            />
          )}

          {/* Article grid */}
          <TabsContent value={activeCategory} className="mt-0">
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onClick={handleArticleClick}
                  />
                ))}
              </div>
            ) : (
              <GlassCard className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  暂无相关资讯
                </p>
              </GlassCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  )
}
