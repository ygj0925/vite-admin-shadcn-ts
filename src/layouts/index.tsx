import { useAppStore } from '@/stores/app'
import { DefaultLayout } from './default-layout'
import { MixLayout } from './mix-layout'
import { ColumnsLayout } from './columns-layout'
import { TopLayout } from './top-layout'

const layoutMap = {
  default: DefaultLayout,
  mix: MixLayout,
  columns: ColumnsLayout,
  top: TopLayout,
}

export function Layout() {
  const layout = useAppStore((s) => s.layout)
  const LayoutComponent = layoutMap[layout] || DefaultLayout
  // 全局 TooltipProvider 在 App.tsx，这里不再重复包裹
  return <LayoutComponent />
}
