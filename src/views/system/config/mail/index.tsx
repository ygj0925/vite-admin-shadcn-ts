import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { getMailConfig, updateMailConfig } from '@/apis/system/common'
import { toast } from 'sonner'

export default function MailConfigPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    ssl: false,
    from: '',
  })

  useEffect(() => {
    setLoading(true)
    getMailConfig()
      .then((res) => {
        setForm({
          host: res.data.host || '',
          port: res.data.port || '',
          username: res.data.username || '',
          password: res.data.password || '',
          ssl: res.data.ssl === 'true' || res.data.ssl === true,
          from: res.data.from || '',
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateMailConfig({
        host: form.host,
        port: form.port,
        username: form.username,
        password: form.password,
        ssl: String(form.ssl),
        from: form.from,
      })
      toast.success('保存成功')
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-medium text-foreground">邮件配置</h1>
        <p className="text-sm text-muted-foreground mt-1">邮件服务配置</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">邮件服务器</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="host">服务器地址</Label>
              <Input id="host" value={form.host} onChange={(e) => handleChange('host', e.target.value)} placeholder="请输入SMTP服务器地址" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="port">端口</Label>
              <Input id="port" value={form.port} onChange={(e) => handleChange('port', e.target.value)} placeholder="请输入端口" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">用户名</Label>
              <Input id="username" value={form.username} onChange={(e) => handleChange('username', e.target.value)} placeholder="请输入用户名" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="请输入密码" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="from">发件人</Label>
              <Input id="from" value={form.from} onChange={(e) => handleChange('from', e.target.value)} placeholder="请输入发件人邮箱" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Label>SSL</Label>
              <Switch checked={form.ssl} onCheckedChange={(v) => handleChange('ssl', v)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
