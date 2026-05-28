import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function AddNoticePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'notice',
    status: 'draft',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      navigate('/system/notice')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-foreground">添加通知</h1>
        <p className="text-sm text-muted-foreground mt-1">创建新的通知公告</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>通知信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                placeholder="请输入通知标题"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">内容</Label>
              <Textarea
                id="content"
                placeholder="请输入通知内容"
                value={form.content}
                onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/system/notice')}>
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '提交中...' : '提交'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
