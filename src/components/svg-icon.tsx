import { useMemo } from 'react'
import { cn } from '@/lib/utils'

// Eagerly load all SVG icons as raw strings via ?raw
// Keys are relative to project root, e.g. "/src/assets/icons/dashboard.svg"
const svgModules = import.meta.glob('../assets/icons/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

// Build a name -> raw SVG map for fast lookup
const iconMap: Record<string, string> = {}
for (const [path, raw] of Object.entries(svgModules)) {
  const name = path.replace(/^.*\//, '').replace(/\.svg$/, '')
  iconMap[name] = raw
}

interface SvgIconProps {
  name: string
  size?: number | string
  className?: string
  style?: React.CSSProperties
}

export function SvgIcon({ name, size = 16, className, style }: SvgIconProps) {
  const svgRaw = useMemo(() => iconMap[name] ?? null, [name])

  if (!svgRaw) {
    return (
      <span
        className={cn('inline-flex items-center justify-center shrink-0 text-[10px] font-medium opacity-50', className)}
        style={{ width: size, height: size, ...style }}
      >
        {name?.[0]?.toUpperCase() ?? '?'}
      </span>
    )
  }

  return (
    <span
      className={cn('inline-flex items-center justify-center shrink-0 [&_svg]:w-full [&_svg]:h-full', className)}
      style={{ width: size, height: size, color: 'currentColor', ...style }}
      dangerouslySetInnerHTML={{ __html: svgRaw }}
    />
  )
}
