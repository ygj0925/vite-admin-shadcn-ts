import { cn } from '@/lib/utils'
import { GlassCard } from './glass-card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  trend?: {
    value: string
    positive: boolean
  }
  icon: React.ReactNode
  iconColor?: string
  className?: string
}

export function StatCard({
  title,
  value,
  trend,
  icon,
  iconColor = 'from-violet-600 to-blue-600',
  className,
}: StatCardProps) {
  return (
    <GlassCard className={cn('p-4', className)} hover>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            'bg-gradient-to-br',
            iconColor
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              {trend.positive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={cn(
                  'text-xs',
                  trend.positive ? 'text-green-500' : 'text-red-500'
                )}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
