import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getStorageConfig, updateStorageConfig } from '@/apis/system/storage'
import { toast } from 'sonner'

export default function StorageConfigPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    type: '',
    basePath: '',
    endpoint: '',
    bucketName: '',
    accessKey: '',
    secretKey: '',
  })

  useEffect(() => {
    setLoading(true)
    getStorageConfig()
      .then((res) => {
        setForm({
          type: res.data.type || '',
          basePath: res.data.basePath || '',
          endpoint: res.data.endpoint || '',
          bucketName: res.data.bucketName || '',
          accessKey: res.data.accessKey || '',
          secretKey: res.data.secretKey || '',
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
      await updateStorageConfig(form)
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
        <h1 className="text-lg font-medium text-foreground">存储配置</h1>
        <p className="text-sm text-muted-foreground mt-1">文件存储配置</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">存储设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>存储类型</Label>
              <Select value={form.type} onValueChange={(v) => handleChange('type', v)}>
                <SelectTrigger><SelectValue placeholder="请选择存储类型" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">本地存储</SelectItem>
                  <SelectItem value="oss">阿里云OSS</SelectItem>
                  <SelectItem value="minio">MinIO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="basePath">基础路径</Label>
              <Input id="basePath" value={form.basePath} onChange={(e) => handleChange('basePath', e.target.value)} placeholder="请输入基础路径" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endpoint">端点地址</Label>
              <Input id="endpoint" value={form.endpoint} onChange={(e) => handleChange('endpoint', e.target.value)} placeholder="请输入端点地址" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bucketName">桶名称</Label>
              <Input id="bucketName" value={form.bucketName} onChange={(e) => handleChange('bucketName', e.target.value)} placeholder="请输入桶名称" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accessKey">AccessKey</Label>
              <Input id="accessKey" value={form.accessKey} onChange={(e) => handleChange('accessKey', e.target.value)} placeholder="请输入AccessKey" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="secretKey">SecretKey</Label>
              <Input id="secretKey" type="password" value={form.secretKey} onChange={(e) => handleChange('secretKey', e.target.value)} placeholder="请输入SecretKey" />
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
