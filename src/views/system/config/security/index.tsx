import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSecurityOptions, updateSecurityOptions } from '@/apis/system/option'
import { toast } from 'sonner'

export default function SecurityConfigPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    passwordMinLength: 6,
    passwordMaxLength: 20,
    passwordRegex: '',
    maxLoginRetry: 5,
    lockTime: 10,
  })

  useEffect(() => {
    setLoading(true)
    getSecurityOptions()
      .then((res) => {
        setForm({
          passwordMinLength: Number(res.data.passwordMinLength) || 6,
          passwordMaxLength: Number(res.data.passwordMaxLength) || 20,
          passwordRegex: res.data.passwordRegex || '',
          maxLoginRetry: Number(res.data.maxLoginRetry) || 5,
          lockTime: Number(res.data.lockTime) || 10,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSecurityOptions({
        passwordMinLength: String(form.passwordMinLength),
        passwordMaxLength: String(form.passwordMaxLength),
        passwordRegex: form.passwordRegex,
        maxLoginRetry: String(form.maxLoginRetry),
        lockTime: String(form.lockTime),
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
        <h1 className="text-lg font-medium text-foreground">安全配置</h1>
        <p className="text-sm text-muted-foreground mt-1">安全策略配置</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">密码策略</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="passwordMinLength">密码最小长度</Label>
              <Input id="passwordMinLength" type="number" value={form.passwordMinLength} onChange={(e) => setForm((prev) => ({ ...prev, passwordMinLength: Number(e.target.value) }))} placeholder="请输入最小长度" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="passwordMaxLength">密码最大长度</Label>
              <Input id="passwordMaxLength" type="number" value={form.passwordMaxLength} onChange={(e) => setForm((prev) => ({ ...prev, passwordMaxLength: Number(e.target.value) }))} placeholder="请输入最大长度" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="passwordRegex">密码正则表达式</Label>
              <Input id="passwordRegex" value={form.passwordRegex} onChange={(e) => setForm((prev) => ({ ...prev, passwordRegex: e.target.value }))} placeholder="请输入密码正则表达式" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">登录策略</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="maxLoginRetry">最大重试次数</Label>
              <Input id="maxLoginRetry" type="number" value={form.maxLoginRetry} onChange={(e) => setForm((prev) => ({ ...prev, maxLoginRetry: Number(e.target.value) }))} placeholder="请输入最大重试次数" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lockTime">锁定时间(分钟)</Label>
              <Input id="lockTime" type="number" value={form.lockTime} onChange={(e) => setForm((prev) => ({ ...prev, lockTime: Number(e.target.value) }))} placeholder="请输入锁定时间" />
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
