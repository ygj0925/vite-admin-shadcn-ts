import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSiteOptions, updateSiteOptions } from '@/apis/system/option'
import { toast } from 'sonner'

export default function SiteConfigPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    siteName: '',
    siteUrl: '',
    logo: '',
    copyright: '',
    icp: '',
  })

  useEffect(() => {
    setLoading(true)
    getSiteOptions()
      .then((res) => {
        setForm({
          siteName: res.data.siteName || '',
          siteUrl: res.data.siteUrl || '',
          logo: res.data.logo || '',
          copyright: res.data.copyright || '',
          icp: res.data.icp || '',
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
      await updateSiteOptions(form)
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
        <h1 className="text-lg font-medium text-foreground">站点配置</h1>
        <p className="text-sm text-muted-foreground mt-1">站点基础配置</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">基础信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="siteName">站点名称</Label>
              <Input id="siteName" value={form.siteName} onChange={(e) => handleChange('siteName', e.target.value)} placeholder="请输入站点名称" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="siteUrl">站点地址</Label>
              <Input id="siteUrl" value={form.siteUrl} onChange={(e) => handleChange('siteUrl', e.target.value)} placeholder="请输入站点地址" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="logo">站点Logo</Label>
              <Input id="logo" value={form.logo} onChange={(e) => handleChange('logo', e.target.value)} placeholder="请输入Logo地址" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="copyright">版权信息</Label>
              <Input id="copyright" value={form.copyright} onChange={(e) => handleChange('copyright', e.target.value)} placeholder="请输入版权信息" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="icp">ICP备案号</Label>
              <Input id="icp" value={form.icp} onChange={(e) => handleChange('icp', e.target.value)} placeholder="请输入ICP备案号" />
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
