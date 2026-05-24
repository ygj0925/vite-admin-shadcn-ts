import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { getLoginOptions, updateLoginOptions } from '@/apis/system/option'
import { toast } from 'sonner'

export default function LoginConfigPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    captchaEnabled: false,
    retryCount: 5,
    retryLockTime: 10,
  })

  useEffect(() => {
    setLoading(true)
    getLoginOptions()
      .then((res) => {
        setForm({
          captchaEnabled: res.data.captchaEnabled === 'true' || res.data.captchaEnabled === true,
          retryCount: Number(res.data.retryCount) || 5,
          retryLockTime: Number(res.data.retryLockTime) || 10,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateLoginOptions({
        captchaEnabled: String(form.captchaEnabled),
        retryCount: String(form.retryCount),
        retryLockTime: String(form.retryLockTime),
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
        <h1 className="text-lg font-medium text-foreground">登录配置</h1>
        <p className="text-sm text-muted-foreground mt-1">登录方式配置</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">登录设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Label className="w-32">验证码开关</Label>
            <Switch checked={form.captchaEnabled} onCheckedChange={(v) => setForm((prev) => ({ ...prev, captchaEnabled: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="retryCount">重试次数</Label>
              <Input id="retryCount" type="number" value={form.retryCount} onChange={(e) => setForm((prev) => ({ ...prev, retryCount: Number(e.target.value) }))} placeholder="请输入重试次数" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="retryLockTime">锁定时间(分钟)</Label>
              <Input id="retryLockTime" type="number" value={form.retryLockTime} onChange={(e) => setForm((prev) => ({ ...prev, retryLockTime: Number(e.target.value) }))} placeholder="请输入锁定时间" />
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
