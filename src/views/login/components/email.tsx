import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUserStore } from '@/stores/user'
import { sendEmailCode } from '@/apis/auth'

export function EmailLogin() {
  const [form, setForm] = useState({
    email: '',
    captcha: '',
  })
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const userLogin = useUserStore((s) => s.login)

  const sendCaptcha = async () => {
    if (!form.email.trim()) return toast.error('请输入邮箱')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return toast.error('请输入正确的邮箱')

    try {
      await sendEmailCode(form.email.trim())
      toast.success('验证码已发送')
      setCountdown(60)
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('发送验证码失败', error)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.trim()) return toast.error('请输入邮箱')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return toast.error('请输入正确的邮箱')
    if (!form.captcha.trim()) return toast.error('请输入验证码')

    try {
      setLoading(true)
      await userLogin({
        clientId: import.meta.env.VITE_CLIENT_ID,
        email: form.email.trim(),
        captcha: form.captcha.trim(),
        authType: 'EMAIL',
      })
      toast.success('登录成功')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          placeholder="请输入邮箱"
          value={form.email}
          onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="captcha">验证码</Label>
        <div className="flex gap-2">
          <Input
            id="captcha"
            placeholder="请输入验证码"
            value={form.captcha}
            onChange={(e) => setForm(prev => ({ ...prev, captcha: e.target.value }))}
            className="flex-1"
            required
          />
          <Button
            type="button"
            variant="outline"
            onClick={sendCaptcha}
            disabled={countdown > 0}
          >
            {countdown > 0 ? `${countdown}s` : '获取验证码'}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? '登录中...' : '立即登录'}
      </Button>
    </form>
  )
}
