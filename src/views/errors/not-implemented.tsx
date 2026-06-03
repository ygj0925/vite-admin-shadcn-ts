import { Construction } from 'lucide-react'

interface NotImplementedProps {
  componentPath?: string
}

export default function NotImplementedPage({ componentPath }: NotImplementedProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <Construction className="h-16 w-16" />
      <h2 className="text-xl font-semibold text-foreground">页面开发中</h2>
      <p className="text-sm">该功能正在迁移中，敬请期待</p>
      {componentPath && (
        <code className="rounded bg-muted px-2 py-1 text-xs">{componentPath}</code>
      )}
    </div>
  )
}
