import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  Lock,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react'
import { useUserStore } from '@/stores/user'
import { updateProfile, updatePassword } from '@/apis/user/profile'
import { PageTransition } from '@/components/app/page-transition'
import { GlassCard } from '@/components/app/glass-card'
import { GradientButton } from '@/components/app/gradient-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const TESLA_BLUE = '#3E6AE1'

export default function AppSettings() {
  const navigate = useNavigate()
  const userInfo = useUserStore((s) => s.userInfo)
  const setUserInfo = useUserStore((s) => s.setUserInfo)

  const nickname = userInfo?.nickname || userInfo?.username || ''
  const email = userInfo?.email || ''
  const phone = userInfo?.phone || ''

  // Basic info form
  const [formNickname, setFormNickname] = useState(nickname)
  const [formEmail, setFormEmail] = useState(email)
  const [formPhone, setFormPhone] = useState(phone)
  const [saving, setSaving] = useState(false)

  // Password form
  const [showPassword, setShowPassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const handleSaveProfile = async () => {
    if (!formNickname.trim()) {
      toast.error('请输入昵称')
      return
    }
    setSaving(true)
    try {
      await updateProfile({
        nickname: formNickname.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
      })
      // Update local state
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          nickname: formNickname.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
        })
      }
      toast('保存成功')
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!oldPassword) {
      toast.error('请输入原密码')
      return
    }
    if (!newPassword) {
      toast.error('请输入新密码')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次密码输入不一致')
      return
    }
    if (newPassword.length < 6) {
      toast.error('密码长度不能少于6位')
      return
    }
    setChangingPassword(true)
    try {
      await updatePassword({ oldPassword, newPassword })
      toast('密码修改成功')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('密码修改失败')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <PageTransition className="p-4 md:p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl glass glass-dark dark:glass-dark light:glass-light transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-semibold">个人设置</h1>
      </div>

      {/* Avatar section */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar size="lg" className="h-20 w-20">
              <AvatarImage src={userInfo?.avatar} alt={nickname} />
              <AvatarFallback
                className="text-2xl font-semibold text-white"
                style={{ backgroundColor: TESLA_BLUE }}
              >
                {nickname.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium">{nickname || '未设置昵称'}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              点击头像可更换头像
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Basic info form */}
      <GlassCard title="基本信息">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-sm">昵称</Label>
            <Input
              id="nickname"
              value={formNickname}
              onChange={(e) => setFormNickname(e.target.value)}
              placeholder="请输入昵称"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="请输入邮箱"
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm">手机号</Label>
            <Input
              id="phone"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="请输入手机号"
              className="h-10"
            />
          </div>
          <GradientButton
            onClick={handleSaveProfile}
            loading={saving}
            className="w-full"
          >
            <Check className="mr-2 h-4 w-4" />
            保存信息
          </GradientButton>
        </div>
      </GlassCard>

      {/* Security settings */}
      <GlassCard title="安全设置">
        <div className="space-y-4">
          {/* Change password */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">修改密码</span>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="原密码"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="新密码"
                className="h-10"
              />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="确认新密码"
                className="h-10"
              />
              <GradientButton
                onClick={handleChangePassword}
                loading={changingPassword}
                variant="secondary"
                className="w-full"
              >
                修改密码
              </GradientButton>
            </div>
          </div>

          <Separator />

          {/* Bind phone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">绑定手机</p>
                <p className="text-xs text-muted-foreground">
                  {phone ? `已绑定 ${phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}` : '未绑定'}
                </p>
              </div>
            </div>
            <GradientButton variant="ghost" size="sm">
              {phone ? '更换' : '绑定'}
            </GradientButton>
          </div>

          <Separator />

          {/* Bind email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">绑定邮箱</p>
                <p className="text-xs text-muted-foreground">
                  {email ? `已绑定 ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}` : '未绑定'}
                </p>
              </div>
            </div>
            <GradientButton variant="ghost" size="sm">
              {email ? '更换' : '绑定'}
            </GradientButton>
          </div>
        </div>
      </GlassCard>
    </PageTransition>
  )
}
