import { useEffect, useState, memo } from 'react'
import { cn } from '@/lib/utils'

// 懒加载：每个 SVG 按需独立 chunk，不再 eager 进主 bundle
// 之前 325 个图标 eager 全量打进主 chunk，约 400KB+ 文本
const svgLoaders = import.meta.glob('../assets/icons/*.svg', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>

// 把 path 解析成 name 字典，避免每次查找时再做字符串处理
const loaderByName: Record<string, () => Promise<string>> = {}
for (const [path, loader] of Object.entries(svgLoaders)) {
  const name = path.replace(/^.*\//, '').replace(/\.svg$/, '')
  loaderByName[name] = loader
}

// module 级缓存：一旦某个 icon 加载过，后续渲染走同步路径，零延迟
const cache = new Map<string, string>()
const pending = new Map<string, Promise<string>>()

function loadIcon(name: string): Promise<string> {
  if (cache.has(name)) return Promise.resolve(cache.get(name)!)
  if (pending.has(name)) return pending.get(name)!
  const loader = loaderByName[name]
  if (!loader) return Promise.resolve('')
  const p = loader().then((raw) => {
    cache.set(name, raw)
    pending.delete(name)
    return raw
  })
  pending.set(name, p)
  return p
}

interface SvgIconProps {
  name: string
  size?: number | string
  className?: string
  style?: React.CSSProperties
}

function SvgIconImpl({ name, size = 16, className, style }: SvgIconProps) {
  // 已缓存的 icon 同步取，避免首帧空白闪烁
  const [svgRaw, setSvgRaw] = useState<string | null>(() => cache.get(name) ?? null)

  useEffect(() => {
    if (cache.has(name)) {
      setSvgRaw(cache.get(name)!)
      return
    }
    let aborted = false
    loadIcon(name).then((raw) => {
      if (!aborted) setSvgRaw(raw)
    })
    return () => { aborted = true }
  }, [name])

  if (!svgRaw) {
    // 加载中或不存在：显示首字母占位（保持原有行为）
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

export const SvgIcon = memo(SvgIconImpl)
