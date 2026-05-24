import { Settings } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type LayoutMode, type TabMode, type AnimateMode } from '@/stores/app'

const layouts: { value: LayoutMode; label: string }[] = [
  { value: 'default', label: '经典' },
  { value: 'mix', label: '混合' },
  { value: 'columns', label: '双栏' },
  { value: 'top', label: '顶部' },
]

const tabModes: { value: TabMode; label: string }[] = [
  { value: 'line', label: '线条' },
  { value: 'card', label: '卡片' },
  { value: 'capsule', label: '胶囊' },
]

const animateModes: { value: AnimateMode; label: string }[] = [
  { value: 'fade', label: '淡入' },
  { value: 'slide', label: '滑动' },
  { value: 'zoom', label: '缩放' },
  { value: 'none', label: '无' },
]

export function SettingDrawer() {
  const { layout, setLayout, tabMode, setTabMode, animateMode, setAnimateMode, tab, setTab } = useAppStore()

  return (
    <Sheet>
      <SheetTrigger className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent transition-colors duration-300">
        <Settings className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>系统配置</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 p-4">
          <div className="space-y-3">
            <Label>布局模式</Label>
            <div className="grid grid-cols-4 gap-2">
              {layouts.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLayout(l.value)}
                  className={`rounded border px-3 py-1.5 text-xs transition-colors duration-300 ${
                    layout === l.value ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <Label>标签页样式</Label>
            <div className="grid grid-cols-3 gap-2">
              {tabModes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTabMode(t.value)}
                  className={`rounded border px-3 py-1.5 text-xs transition-colors duration-300 ${
                    tabMode === t.value ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <Label>页面动画</Label>
            <div className="grid grid-cols-4 gap-2">
              {animateModes.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAnimateMode(a.value)}
                  className={`rounded border px-3 py-1.5 text-xs transition-colors duration-300 ${
                    animateMode === a.value ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label>显示标签页</Label>
            <button
              onClick={() => setTab(!tab)}
              className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${tab ? 'bg-primary' : 'bg-input'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-300 ${tab ? 'left-4.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
