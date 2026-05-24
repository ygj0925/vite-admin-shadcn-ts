import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSmsConfig, updateSmsConfig } from '@/apis/system/sms'
import { toast } from 'sonner'

export default function SmsConfigPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    provider: '',
    accessKey: '',
    secretKey: '',
    signName: '',
    templateCode: '',
  })

  useEffect(() => {
    setLoading(true)
    getSmsConfig()
      .then((res) => {
        setForm({
          provider: res.data.provider || '',
          accessKey: res.data.accessKey || '',
          secretKey: res.data.secretKey || '',
          signName: res.data.signName || '',
          templateCode: res.data.templateCode || '',
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSmsConfig(form)
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
        <h1 className="text-lg font-medium text-foreground">短信配置</h1>
        <p className="text-sm text-muted-foreground mt-1">短信服务配置</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">短信服务</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>服务商</Label>
              <Select value={form.provider} onValueChange={(v) => handleChange('provider', v)}>
                <SelectTrigger><SelectValue placeholder="请选择服务商" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aliyun">阿里云</SelectItem>
                  <SelectItem value="tencent">腾讯云</SelectItem>
                  <SelectItem value="huawei">华为云</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accessKey">AccessKey</Label>
              <Input id="accessKey" value={form.accessKey} onChange={(e) => handleChange('accessKey', e.target.value)} placeholder="请输入AccessKey" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="secretKey">SecretKey</Label>
              <Input id="secretKey" type="password" value={form.secretKey} onChange={(e) => handleChange('secretKey', e.target.value)} placeholder="请输入SecretKey" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signName">签名名称</Label>
              <Input id="signName" value={form.signName} onChange={(e) => handleChange('signName', e.target.value)} placeholder="请输入签名名称" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="templateCode">模板编码</Label>
              <Input id="templateCode" value={form.templateCode} onChange={(e) => handleChange('templateCode', e.target.value)} placeholder="请输入模板编码" />
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
