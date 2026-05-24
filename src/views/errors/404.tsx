import { useNavigate } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-2xl font-medium text-foreground">404</h1>
      <p className="text-muted-foreground">抱歉，您访问的页面不存在</p>
      <Button onClick={() => navigate('/')}>返回首页</Button>
    </div>
  )
}
