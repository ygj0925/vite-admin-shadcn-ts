import { cn } from '@/lib/utils'

interface LogoProps {
  collapsed?: boolean
  className?: string
}

export function Logo({ collapsed, className }: LogoProps) {
  return (
    <div className={cn('flex h-12 items-center gap-2 px-4 font-medium', className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground text-sm font-bold">
        C
      </div>
      {!collapsed && (
        <span className="text-foreground whitespace-nowrap">ContiNew Admin</span>
      )}
    </div>
  )
}
