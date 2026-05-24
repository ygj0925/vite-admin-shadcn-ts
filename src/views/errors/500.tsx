import { useNavigate } from 'react-router-dom'
import { ServerCrash } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ServerErrorPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <ServerCrash className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-2xl font-medium text-foreground">500</h1>
      <p className="text-muted-foreground">服务器错误</p>
      <Button onClick={() => navigate('/')}>返回首页</Button>
    </div>
  )
}
