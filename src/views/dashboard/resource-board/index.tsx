import { Construction } from 'lucide-react'

export default function ResourceBoardPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <Construction className="h-16 w-16" />
      <h2 className="text-xl font-semibold text-foreground">资源看板</h2>
      <p className="text-sm">该页面正在从旧项目迁移中，敬请期待</p>
    </div>
  )
}
