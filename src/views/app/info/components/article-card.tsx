import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/app/glass-card'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye, ArrowRight } from 'lucide-react'

export interface Article {
  id: number
  title: string
  excerpt: string
  category: string
  date: string
  views: number
  gradientFrom: string
  gradientTo: string
}

interface ArticleCardProps {
  article: Article
  onClick?: (article: Article) => void
  className?: string
}

const categoryColors: Record<string, string> = {
  '公司新闻': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  '行业动态': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  '技术文章': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  '活动公告': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

export function ArticleCard({ article, onClick, className }: ArticleCardProps) {
  return (
    <div
      className={cn('cursor-pointer', className)}
      onClick={() => onClick?.(article)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(article)
      }}
    >
    <GlassCard
      className="group overflow-hidden p-0 transition-all"
      hover
    >
      {/* Thumbnail gradient */}
      <div
        className="relative h-32 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${article.gradientFrom}, ${article.gradientTo})`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-white/20">
            {article.title.charAt(0)}
          </span>
        </div>
        {/* Hover arrow */}
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ArrowRight className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              'text-[10px] font-medium',
              categoryColors[article.category] || 'bg-muted text-muted-foreground'
            )}
          >
            {article.category}
          </Badge>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
          {article.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
          {article.excerpt}
        </p>
        <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.date}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {article.views}
          </span>
        </div>
      </div>
    </GlassCard>
    </div>
  )
}
