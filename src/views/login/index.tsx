import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { JSEncrypt } from 'jsencrypt'
import { toast } from 'sonner'
import {
  Loader2,
  GitFork,
  GitBranch,
  MessageCircle,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Building2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import {
  getCaptcha,
  getSocialAuthUrl,
  sendSmsCode,
  sendEmailCode,
} from '@/apis/auth'

// RSA public key (from backend application-dev.yml)
const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAM51dgYtMyF+tTQt80sfFOpSV27a7t9u
aUVeFrdGiVxscuizE7H8SMntYqfn9lp8a5GH5P1/GGehVjUD2gF/4kcCAwEAAQ==
-----END PUBLIC KEY-----`

type LoginTab = 'account' | 'phone' | 'email' | 'social'

interface CaptchaData {
  img: string
  uuid: string
}

function encryptPassword(password: string): string {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(RSA_PUBLIC_KEY)
  const encrypted = encrypt.encrypt(password)
  if (!encrypted) {
    throw new Error('密码加密失败')
  }
  return encrypted
}

function useCountdown(initialSeconds = 60) {
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    setCountdown(initialSeconds)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [initialSeconds])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return { countdown, start }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const userLogin = useUserStore((s) => s.login)
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)

  const redirect = searchParams.get('redirect') || '/'

  // Tenant state
  const [tenantCode, setTenantCode] = useState('')

  // --- Account login state ---
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captchaCode, setCaptchaCode] = useState('')
  const [captchaData, setCaptchaData] = useState<CaptchaData>({
    img: '',
    uuid: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [accountLoading, setAccountLoading] = useState(false)

  // --- Phone login state ---
  const [phone, setPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(false)
  const phoneCountdown = useCountdown()

  // --- Email login state ---
  const [email, setEmail] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const emailCountdown = useCountdown()

  // --- Social login state ---
  const [socialLoading, setSocialLoading] = useState<string | null>(null)

  // Load captcha on mount
  useEffect(() => {
    refreshCaptcha()
  }, [])

  async function refreshCaptcha() {
    try {
      const res = await getCaptcha()
      setCaptchaData(res.data)
    } catch {
      toast.error('获取验证码失败')
    }
  }

  // --- Account login ---
  async function handleAccountLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return toast.error('请输入用户名')
    if (!password) return toast.error('请输入密码')
    if (!captchaCode.trim()) return toast.error('请输入验证码')

    setAccountLoading(true)
    try {
      const encryptedPwd = encryptPassword(password)
      await userLogin({
        clientId: import.meta.env.VITE_CLIENT_ID,
        username: username.trim(),
        password: encryptedPwd,
        captcha: captchaCode.trim(),
        uuid: captchaData.uuid,
        authType: 'ACCOUNT',
        ...(tenantCode.trim() ? { tenantCode: tenantCode.trim() } : {}),
      })
      toast.success('登录成功')
      navigate(redirect, { replace: true })
    } catch {
      refreshCaptcha()
      setCaptchaCode('')
    } finally {
      setAccountLoading(false)
    }
  }

  // --- Phone login ---
  async function handleSendSmsCode() {
    if (!phone.trim()) return toast.error('请输入手机号')
    if (!/^1[3-9]\d{9}$/.test(phone.trim()))
      return toast.error('请输入正确的手机号')

    try {
      await sendSmsCode(phone.trim())
      toast.success('验证码已发送')
      phoneCountdown.start()
    } catch {
      // Error toast handled by interceptor
    }
  }

  async function handlePhoneLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return toast.error('请输入手机号')
    if (!/^1[3-9]\d{9}$/.test(phone.trim()))
      return toast.error('请输入正确的手机号')
    if (!phoneCode.trim()) return toast.error('请输入验证码')

    setPhoneLoading(true)
    try {
      await userLogin({
        clientId: import.meta.env.VITE_CLIENT_ID,
        phone: phone.trim(),
        captcha: phoneCode.trim(),
        authType: 'PHONE',
        ...(tenantCode.trim() ? { tenantCode: tenantCode.trim() } : {}),
      })
      toast.success('登录成功')
      navigate(redirect, { replace: true })
    } catch {
      // Error toast handled by interceptor
    } finally {
      setPhoneLoading(false)
    }
  }

  // --- Email login ---
  async function handleSendEmailCode() {
    if (!email.trim()) return toast.error('请输入邮箱')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return toast.error('请输入正确的邮箱')

    try {
      await sendEmailCode(email.trim())
      toast.success('验证码已发送')
      emailCountdown.start()
    } catch {
      // Error toast handled by interceptor
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return toast.error('请输入邮箱')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return toast.error('请输入正确的邮箱')
    if (!emailCode.trim()) return toast.error('请输入验证码')

    setEmailLoading(true)
    try {
      await userLogin({
        clientId: import.meta.env.VITE_CLIENT_ID,
        email: email.trim(),
        captcha: emailCode.trim(),
        authType: 'EMAIL',
        ...(tenantCode.trim() ? { tenantCode: tenantCode.trim() } : {}),
      })
      toast.success('登录成功')
      navigate(redirect, { replace: true })
    } catch {
      // Error toast handled by interceptor
    } finally {
      setEmailLoading(false)
    }
  }

  // --- Social login ---
  async function handleSocialLogin(source: string) {
    setSocialLoading(source)
    try {
      const res = await getSocialAuthUrl(source)
      window.location.href = res.data.authorizeUrl
    } catch {
      toast.error('获取授权地址失败')
      setSocialLoading(null)
    }
  }

  const socialButtons = [
    { key: 'gitee', label: 'Gitee', icon: GitBranch },
    { key: 'github', label: 'GitHub', icon: GitFork },
    { key: 'wechat', label: '微信', icon: MessageCircle },
  ]

  return (
    <div className="flex min-h-screen">
      {/* ---- Left Panel: Branding ---- */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] items-center justify-center">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-[#3E6AE1]/10 blur-3xl" />
        <div className="absolute bottom-32 right-16 h-48 w-48 rounded-full bg-[#3E6AE1]/15 blur-2xl" />

        <div className="relative z-10 px-16 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm mb-8">
            <span className="text-3xl font-bold text-white">C</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            ContiNew Admin
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-md">
            持续迭代的后台管理系统前端解决方案
          </p>
          <div className="mt-10 flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">React 19</p>
              <p className="text-xs text-white/50 mt-1">前端框架</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">Shadcn/ui</p>
              <p className="text-xs text-white/50 mt-1">组件库</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">Tailwind 4</p>
              <p className="text-xs text-white/50 mt-1">CSS 框架</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Right Panel: Login Form ---- */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center bg-white dark:bg-background px-4 py-8">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-accent transition-colors"
          title={theme === 'light' ? '切换暗色模式' : '切换亮色模式'}
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>

        <div className="w-full max-w-[400px]">
          {/* Mobile-only branding */}
          <div className="mb-8 text-center lg:hidden">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
              <span className="text-xl font-bold text-primary">C</span>
            </div>
            <h1 className="text-2xl font-medium leading-tight text-foreground">
              ContiNew Admin
            </h1>
          </div>

          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-[28px] font-medium leading-tight text-[#171A20] dark:text-foreground">
              欢迎登录
            </h2>
            <p className="mt-2 text-sm text-[#5C5E62] dark:text-muted-foreground">
              登录您的账户以继续
            </p>
          </div>

          {/* Tenant Code (optional) */}
          <div className="mb-4 space-y-2">
            <Label
              htmlFor="tenantCode"
              className="text-sm font-medium text-[#393C41] dark:text-foreground"
            >
              <Building2 className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              租户编码
              <span className="text-xs text-muted-foreground ml-1">
                (选填)
              </span>
            </Label>
            <Input
              id="tenantCode"
              type="text"
              placeholder="请输入租户编码"
              value={tenantCode}
              onChange={(e) => setTenantCode(e.target.value)}
              className="h-10 border-[#D0D1D2] bg-white text-sm focus-visible:ring-[#3E6AE1]"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-4 bg-[#F4F4F4] dark:bg-muted p-1">
              <TabsTrigger value="account" className="text-xs">
                账户
              </TabsTrigger>
              <TabsTrigger value="phone" className="text-xs">
                手机
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xs">
                邮箱
              </TabsTrigger>
              <TabsTrigger value="social" className="text-xs">
                第三方
              </TabsTrigger>
            </TabsList>

            {/* Account Login */}
            <TabsContent value="account">
              <form onSubmit={handleAccountLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-[#393C41] dark:text-foreground"
                  >
                    用户名
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="h-10 border-[#D0D1D2] bg-white text-sm focus-visible:ring-[#3E6AE1]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-[#393C41] dark:text-foreground"
                  >
                    密码
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="h-10 border-[#D0D1D2] bg-white pr-10 text-sm focus-visible:ring-[#3E6AE1]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E8E] hover:text-[#393C41]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="captcha"
                    className="text-sm font-medium text-[#393C41] dark:text-foreground"
                  >
                    验证码
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="captcha"
                      type="text"
                      placeholder="请输入验证码"
                      value={captchaCode}
                      onChange={(e) => setCaptchaCode(e.target.value)}
                      maxLength={6}
                      className="h-10 flex-1 border-[#D0D1D2] bg-white text-sm focus-visible:ring-[#3E6AE1]"
                    />
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="h-10 shrink-0 overflow-hidden rounded bg-[#F4F4F4]"
                      title="点击刷新验证码"
                    >
                      {captchaData.img ? (
                        <img
                          src={captchaData.img}
                          alt="验证码"
                          className="h-full w-[120px] object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-[120px] items-center justify-center text-xs text-[#8E8E8E]">
                          加载中...
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={accountLoading}
                  className="h-10 w-full bg-[#3E6AE1] text-sm font-medium hover:bg-[#2D5BD1]"
                >
                  {accountLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  登录
                </Button>
              </form>
            </TabsContent>

            {/* Phone Login */}
            <TabsContent value="phone">
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-[#393C41] dark:text-foreground"
                  >
                    手机号
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="请输入手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={11}
                    autoComplete="tel"
                    className="h-10 border-[#D0D1D2] bg-white text-sm focus-visible:ring-[#3E6AE1]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phoneCode"
                    className="text-sm font-medium text-[#393C41] dark:text-foreground"
                  >
                    验证码
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="phoneCode"
                      type="text"
                      placeholder="请输入验证码"
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      maxLength={6}
                      className="h-10 flex-1 border-[#D0D1D2] bg-white text-sm focus-visible:ring-[#3E6AE1]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={phoneCountdown.countdown > 0}
                      onClick={handleSendSmsCode}
                      className="h-10 shrink-0 border-[#D0D1D2] px-3 text-sm text-[#3E6AE1]"
                    >
                      {phoneCountdown.countdown > 0
                        ? `${phoneCountdown.countdown}s`
                        : '获取验证码'}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={phoneLoading}
                  className="h-10 w-full bg-[#3E6AE1] text-sm font-medium hover:bg-[#2D5BD1]"
                >
                  {phoneLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  登录
                </Button>
              </form>
            </TabsContent>

            {/* Email Login */}
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-[#393C41] dark:text-foreground"
                  >
                    邮箱
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="h-10 border-[#D0D1D2] bg-white text-sm focus-visible:ring-[#3E6AE1]"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="emailCode"
                    className="text-sm font-medium text-[#393C41] dark:text-foreground"
                  >
                    验证码
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="emailCode"
                      type="text"
                      placeholder="请输入验证码"
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                      maxLength={6}
                      className="h-10 flex-1 border-[#D0D1D2] bg-white text-sm focus-visible:ring-[#3E6AE1]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={emailCountdown.countdown > 0}
                      onClick={handleSendEmailCode}
                      className="h-10 shrink-0 border-[#D0D1D2] px-3 text-sm text-[#3E6AE1]"
                    >
                      {emailCountdown.countdown > 0
                        ? `${emailCountdown.countdown}s`
                        : '获取验证码'}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={emailLoading}
                  className="h-10 w-full bg-[#3E6AE1] text-sm font-medium hover:bg-[#2D5BD1]"
                >
                  {emailLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  登录
                </Button>
              </form>
            </TabsContent>

            {/* Social Login */}
            <TabsContent value="social">
              <div className="space-y-3">
                {socialButtons.map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    disabled={socialLoading !== null}
                    onClick={() => handleSocialLogin(key)}
                    className="h-10 w-full border-[#D0D1D2] text-sm font-medium text-[#393C41] hover:bg-[#F4F4F4]"
                  >
                    {socialLoading === key ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="mr-2 h-4 w-4" />
                    )}
                    使用 {label} 登录
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <Separator className="my-6 bg-[#EEEEEE] dark:bg-border" />
          <p className="text-center text-xs text-[#8E8E8E] dark:text-muted-foreground">
            登录即表示您同意我们的服务条款和隐私政策
          </p>
          <p className="text-center text-xs text-[#B0B0B0] dark:text-muted-foreground/60 mt-2">
            Copyright &copy; 2024 ContiNew Admin. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
