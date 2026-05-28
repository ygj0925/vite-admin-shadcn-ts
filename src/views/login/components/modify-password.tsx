import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePassword } from '@/apis/user/profile'

export function ModifyPassword() {
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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

    try {
      setLoading(true)
      await updatePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      toast.success('密码修改成功')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="oldPassword">原密码</Label>
        <div className="relative">
          <Input
            id="oldPassword"
            type={showOld ? 'text' : 'password'}
            placeholder="请输入原密码"
            value={form.oldPassword}
            onChange={(e) => setForm(prev => ({ ...prev, oldPassword: e.target.value }))}
            className="pr-10"
            required
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

      <div className="space-y-2">
        <Label htmlFor="newPassword">新密码</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNew ? 'text' : 'password'}
            placeholder="请输入新密码"
            value={form.newPassword}
            onChange={(e) => setForm(prev => ({ ...prev, newPassword: e.target.value }))}
            className="pr-10"
            required
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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">确认密码</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="请再次输入新密码"
            value={form.confirmPassword}
            onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="pr-10"
            required
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? '修改中...' : '修改密码'}
      </Button>
    </form>
  )
}
