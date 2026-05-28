import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useUserStore } from '@/stores/user'
import { getImageCaptcha } from '@/apis/common/captcha'
import { encryptByRsa } from '@/utils/encrypt'

export function AccountLogin() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    captcha: '',
    uuid: '',
    expired: false,
  })
  const [captchaImg, setCaptchaImg] = useState('')
  const [isCaptchaEnabled, setIsCaptchaEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [tenantCode, setTenantCode] = useState('')

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const userLogin = useUserStore((s) => s.login)

  const getCaptcha = async () => {
    try {
      const res = await getImageCaptcha()
      const { uuid, img, expireTime, isEnabled } = res.data
      setIsCaptchaEnabled(isEnabled)
      setCaptchaImg(img)
      setForm(prev => ({ ...prev, uuid, expired: false }))
      startTimer(expireTime, Number(res.timestamp))
    } catch (error) {
      console.error('获取验证码失败', error)
    }
  }

  const startTimer = (expireTime: number, curTime = Date.now()) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    const remainingTime = expireTime - curTime
    if (remainingTime <= 0) {
      setForm(prev => ({ ...prev, expired: true }))
      return
    }
    timerRef.current = setTimeout(() => {
      setForm(prev => ({ ...prev, expired: true }))
    }, remainingTime)
  }

  useEffect(() => {
    getCaptcha()
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username.trim()) return toast.error('请输入用户名')
    if (!form.password) return toast.error('请输入密码')
    if (isCaptchaEnabled && !form.captcha.trim()) return toast.error('请输入验证码')

    try {
      setLoading(true)
      await userLogin({
        clientId: import.meta.env.VITE_CLIENT_ID,
        username: form.username.trim(),
        password: encryptByRsa(form.password) || '',
        captcha: form.captcha,
        uuid: form.uuid,
        authType: 'ACCOUNT',
        ...(tenantCode.trim() ? { tenantCode: tenantCode.trim() } : {}),
      })
      toast.success('登录成功')
    } catch (error) {
      console.error(error)
      getCaptcha()
      setForm(prev => ({ ...prev, captcha: '' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tenantCode">
          <Building2 className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
          租户编码
          <span className="text-xs text-muted-foreground ml-1">(选填)</span>
        </Label>
        <Input
          id="tenantCode"
          placeholder="请输入租户编码"
          value={tenantCode}
          onChange={(e) => setTenantCode(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">用户名</Label>
        <Input
          id="username"
          placeholder="请输入用户名"
          value={form.username}
          onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
          autoComplete="username"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="请输入密码"
            value={form.password}
            onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
            autoComplete="current-password"
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {isCaptchaEnabled && (
        <div className="space-y-2">
          <Label htmlFor="captcha">验证码</Label>
          <div className="flex gap-2">
            <Input
              id="captcha"
              placeholder="请输入验证码"
              maxLength={4}
              value={form.captcha}
              onChange={(e) => setForm(prev => ({ ...prev, captcha: e.target.value }))}
              className="flex-1"
            />
            <div
              className="cursor-pointer relative shrink-0"
              onClick={getCaptcha}
              title="点击刷新验证码"
            >
              {captchaImg ? (
                <img
                  src={captchaImg}
                  alt="验证码"
                  className="h-10 w-[120px] object-cover rounded bg-muted"
                />
              ) : (
                <div className="h-10 w-[120px] flex items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                  加载中...
                </div>
              )}
              {form.expired && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                  <span className="text-white text-xs">已过期</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <Label htmlFor="rememberMe" className="text-sm">记住我</Label>
        </div>
        <a href="#" className="text-sm text-primary hover:underline">
          忘记密码
        </a>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? '登录中...' : '立即登录'}
      </Button>
    </form>
  )
}
