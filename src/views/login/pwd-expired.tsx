import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updatePassword } from '@/apis/user/profile'
import { toast } from 'sonner'

export default function PwdExpiredPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.oldPassword.trim()) {
      toast.error('请输入旧密码')
      return
    }
    if (!form.newPassword.trim()) {
      toast.error('请输入新密码')
      return
    }
    if (form.newPassword.length < 6) {
      toast.error('新密码长度不能少于6位')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }
    if (form.oldPassword === form.newPassword) {
      toast.error('新密码不能与旧密码相同')
      return
    }

    setSaving(true)
    try {
      await updatePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      toast.success('密码修改成功，请重新登录')
      navigate('/login', { replace: true })
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md rounded shadow-none border">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <KeyRound className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-lg">密码已过期</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            您的密码已过期，请修改密码后继续使用
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Old password */}
            <div className="space-y-1.5">
              <Label htmlFor="oldPassword">旧密码</Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  type={showOld ? 'text' : 'password'}
                  placeholder="请输入旧密码"
                  value={form.oldPassword}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, oldPassword: e.target.value }))
                  }
                  autoComplete="current-password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">新密码</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="请输入新密码（至少6位）"
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  autoComplete="new-password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="请再次输入新密码"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  autoComplete="new-password"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password strength hints */}
            <div className="rounded bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground/80">密码要求：</p>
              <div className="flex items-center gap-1.5">
                <CheckCircle2
                  className={`h-3.5 w-3.5 ${
                    form.newPassword.length >= 6
                      ? 'text-green-500'
                      : 'text-muted-foreground/40'
                  }`}
                />
                <span>长度不少于 6 位</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2
                  className={`h-3.5 w-3.5 ${
                    form.newPassword !== form.oldPassword &&
                    form.newPassword.length > 0
                      ? 'text-green-500'
                      : 'text-muted-foreground/40'
                  }`}
                />
                <span>不能与旧密码相同</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2
                  className={`h-3.5 w-3.5 ${
                    form.newPassword === form.confirmPassword &&
                    form.confirmPassword.length > 0
                      ? 'text-green-500'
                      : 'text-muted-foreground/40'
                  }`}
                />
                <span>两次密码一致</span>
              </div>
            </div>

            <Button type="submit" className="w-full h-10" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认修改
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
