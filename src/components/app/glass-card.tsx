import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GlassCardProps {
  title?: string
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({
  title,
  children,
  className,
  hover = true,
}: GlassCardProps) {
  return (
    <Card
      className={cn(
        'glass glass-dark dark:glass-dark light:glass-light',
        'rounded-2xl border-white/10 dark:border-white/10 light:border-black/10',
        hover && 'hover-lift',
        'animate-card-enter',
        className
      )}
    >
      {title && (
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
