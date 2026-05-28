import { cn } from '@/lib/utils'

interface AppIconProps {
  icon: React.ReactNode
  label: string
  color?: string
  onClick?: () => void
  className?: string
}

export function AppIcon({
  icon,
  label,
  color = 'from-violet-600 to-blue-600',
  onClick,
  className,
}: AppIconProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-2xl',
        'glass glass-dark dark:glass-dark light:glass-light',
        'hover-lift transition-all cursor-pointer',
        'group',
        className
      )}
    >
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl',
          'bg-gradient-to-br transition-transform group-hover:scale-110',
          color
        )}
      >
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
