import { cn } from '@/lib/utils'

interface LogoProps {
  collapsed?: boolean
  className?: string
}

export function Logo({ collapsed, className }: LogoProps) {
  return (
    <div className={cn(
      'flex h-14 items-center gap-2.5 border-b border-sidebar-border/60',
      collapsed ? 'justify-center px-2' : 'px-5',
      className
    )}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm shadow-primary/25">
        C
      </div>
      {!collapsed && (
        <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight text-foreground">
          ContiNew
        </span>
      )}
    </div>
  )
}
