import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUserStore } from '@/stores/user'
import { sendSmsCode } from '@/apis/auth'

export function PhoneLogin() {
  const [form, setForm] = useState({
    phone: '',
    captcha: '',
  })
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const userLogin = useUserStore((s) => s.login)

  const sendCaptcha = async () => {
    if (!form.phone.trim()) return toast.error('请输入手机号')
    if (!/^1[3-9]\d{9}$/.test(form.phone.trim())) return toast.error('请输入正确的手机号')

    try {
      await sendSmsCode(form.phone.trim())
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
    if (!form.phone.trim()) return toast.error('请输入手机号')
    if (!/^1[3-9]\d{9}$/.test(form.phone.trim())) return toast.error('请输入正确的手机号')
    if (!form.captcha.trim()) return toast.error('请输入验证码')

    try {
      setLoading(true)
      await userLogin({
        clientId: import.meta.env.VITE_CLIENT_ID,
        phone: form.phone.trim(),
        captcha: form.captcha.trim(),
        authType: 'PHONE',
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
        <Label htmlFor="phone">手机号</Label>
        <Input
          id="phone"
          placeholder="请输入手机号"
          value={form.phone}
          onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
          maxLength={11}
          autoComplete="tel"
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
