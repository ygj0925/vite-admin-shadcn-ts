import { useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <ShieldAlert className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-2xl font-medium text-foreground">403</h1>
      <p className="text-muted-foreground">抱歉，您没有权限访问此页面</p>
      <Button onClick={() => navigate('/')}>返回首页</Button>
    </div>
  )
}
