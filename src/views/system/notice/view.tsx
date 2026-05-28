import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ViewNoticePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [notice, setNotice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setNotice({
          id,
          title: '通知标题',
          content: '通知内容',
          type: 'notice',
          status: 'published',
          createTime: '2026-05-28',
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotice()
  }, [id])

  if (loading) {
    return <div>加载中...</div>
  }

  if (!notice) {
    return <div>通知不存在</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-foreground">查看通知</h1>
          <p className="text-sm text-muted-foreground mt-1">查看通知详情</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/system/notice')}>
          返回列表
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{notice.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>类型: {notice.type}</span>
              <span>状态: {notice.status}</span>
              <span>创建时间: {notice.createTime}</span>
            </div>
            <div className="prose max-w-none">
              {notice.content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
