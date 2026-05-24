import { useState, useEffect, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import {
  Camera,
  Pencil,
  Shield,
  Link2,
  Unlink,
  Loader2,
  Save,
  Lock,
  Smartphone,
  Mail,
  KeyRound,
  GitBranch,
  GitFork,
  MessageCircle,
  Building2,
  CalendarDays,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useUserStore } from '@/stores/user'
import { updateProfile, updatePassword, updateAvatar } from '@/apis/user/profile'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', (e) => reject(e))
    img.setAttribute('crossOrigin', 'anonymous')
    img.src = url
  })
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
): Promise<string> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )
  return canvas.toDataURL('image/png')
}

/* ------------------------------------------------------------------ */
/*  BasicInfo Update Modal                                           */
/* ------------------------------------------------------------------ */

interface BasicInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userInfo: any
  onSuccess: () => void
}

function BasicInfoUpdateModal({
  open,
  onOpenChange,
  userInfo,
  onSuccess,
}: BasicInfoModalProps) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nickname: '',
    gender: 0,
    email: '',
    phone: '',
    description: '',
  })

  useEffect(() => {
    if (userInfo && open) {
      setForm({
        nickname: userInfo.nickname || '',
        gender: userInfo.gender || 0,
        email: userInfo.email || '',
        phone: userInfo.phone || '',
        description: userInfo.description || '',
      })
    }
  }, [userInfo, open])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('保存成功')
      onOpenChange(false)
      onSuccess()
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>编辑基本信息</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>昵称</Label>
              <Input
                value={form.nickname}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nickname: e.target.value }))
                }
                placeholder="请输入昵称"
              />
            </div>
            <div className="space-y-1.5">
              <Label>性别</Label>
              <Select
                value={String(form.gender)}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, gender: Number(v) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">未知</SelectItem>
                  <SelectItem value="1">男</SelectItem>
                  <SelectItem value="2">女</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>邮箱</Label>
              <Input
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="请输入邮箱"
              />
            </div>
            <div className="space-y-1.5">
              <Label>手机号</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="请输入手机号"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>个人描述</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="介绍一下自己"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Password Modal                                                   */
/* ------------------------------------------------------------------ */

interface PasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PasswordModal({ open, onOpenChange }: PasswordModalProps) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSave = async () => {
    if (!form.oldPassword || !form.newPassword) {
      toast.error('请填写完整')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('两次密码不一致')
      return
    }
    setSaving(true)
    try {
      await updatePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      toast.success('密码修改成功')
      onOpenChange(false)
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>旧密码</Label>
            <Input
              type="password"
              value={form.oldPassword}
              onChange={(e) =>
                setForm((p) => ({ ...p, oldPassword: e.target.value }))
              }
              placeholder="请输入旧密码"
            />
          </div>
          <div className="space-y-1.5">
            <Label>新密码</Label>
            <Input
              type="password"
              value={form.newPassword}
              onChange={(e) =>
                setForm((p) => ({ ...p, newPassword: e.target.value }))
              }
              placeholder="请输入新密码"
            />
          </div>
          <div className="space-y-1.5">
            <Label>确认密码</Label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((p) => ({ ...p, confirmPassword: e.target.value }))
              }
              placeholder="请确认新密码"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            确认修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Profile Page                                                */
/* ------------------------------------------------------------------ */

const genderLabel: Record<number, string> = {
  0: '未知',
  1: '男',
  2: '女',
}

export default function ProfilePage() {
  const userInfo = useUserStore((s) => s.userInfo)
  const fetchUserInfo = useUserStore((s) => s.fetchUserInfo)

  // Avatar cropper state
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Modals
  const [basicInfoOpen, setBasicInfoOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  useEffect(() => {
    fetchUserInfo()
  }, [fetchUserInfo])

  const onCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarSrc(reader.result as string)
      setAvatarDialogOpen(true)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleUploadAvatar = async () => {
    if (!croppedAreaPixels || !avatarSrc) return
    setUploading(true)
    try {
      const cropped = await getCroppedImg(avatarSrc, croppedAreaPixels)
      await updateAvatar(cropped)
      toast.success('头像更新成功')
      setAvatarDialogOpen(false)
      fetchUserInfo()
    } catch {
      // handled by interceptor
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-medium text-foreground">个人中心</h1>
        <p className="text-sm text-muted-foreground mt-1">用户个人信息管理</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ---- Left Column: Avatar Card ---- */}
        <Card className="lg:col-span-1 rounded">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="h-24 w-24">
                <AvatarImage src={userInfo?.avatar} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {userInfo?.nickname?.[0] ||
                    userInfo?.username?.[0] ||
                    'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <h2 className="text-lg font-medium mt-4">
              {userInfo?.nickname || userInfo?.username}
            </h2>

            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span>{(userInfo as any)?.deptName || '未分配部门'}</span>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {userInfo?.roleNames?.map((r: string) => (
                <span
                  key={r}
                  className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs text-primary"
                >
                  {r}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ---- Right Column ---- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card className="rounded">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                基本信息
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBasicInfoOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                编辑
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                <InfoItem label="昵称" value={userInfo?.nickname} />
                <InfoItem
                  label="性别"
                  value={genderLabel[userInfo?.gender ?? 0]}
                />
                <InfoItem label="邮箱" value={userInfo?.email} />
                <InfoItem label="手机号" value={userInfo?.phone} />
                <InfoItem
                  label="个人描述"
                  value={(userInfo as any)?.description}
                  className="col-span-2"
                />
                <InfoItem
                  label="所属部门"
                  value={(userInfo as any)?.deptName}
                />
                <InfoItem
                  label="角色"
                  value={userInfo?.roleNames?.join('、')}
                />
                <InfoItem
                  label="注册时间"
                  value={(userInfo as any)?.createTime}
                  className="col-span-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="rounded">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                安全设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y">
              <SecurityRow
                icon={<Smartphone className="h-4 w-4" />}
                label="手机绑定"
                description={
                  userInfo?.phone
                    ? `已绑定：${userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`
                    : '未绑定手机号'
                }
                bound={!!userInfo?.phone}
                actionLabel={userInfo?.phone ? '更换' : '绑定'}
              />
              <SecurityRow
                icon={<Mail className="h-4 w-4" />}
                label="邮箱绑定"
                description={
                  userInfo?.email
                    ? `已绑定：${userInfo.email}`
                    : '未绑定邮箱'
                }
                bound={!!userInfo?.email}
                actionLabel={userInfo?.email ? '更换' : '绑定'}
              />
              <SecurityRow
                icon={<KeyRound className="h-4 w-4" />}
                label="登录密码"
                description="已设置密码"
                bound
                actionLabel="修改"
                onAction={() => setPasswordOpen(true)}
              />
            </CardContent>
          </Card>

          {/* Social Card */}
          <Card className="rounded">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                社交账号
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y">
              <SocialRow
                icon={<GitBranch className="h-4 w-4" />}
                label="Gitee"
                bound={false}
              />
              <SocialRow
                icon={<GitFork className="h-4 w-4" />}
                label="GitHub"
                bound={false}
              />
              <SocialRow
                icon={<MessageCircle className="h-4 w-4" />}
                label="微信"
                bound={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avatar Cropper Dialog */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>裁剪头像</DialogTitle>
          </DialogHeader>
          <div className="relative h-72 w-full bg-muted rounded overflow-hidden">
            {avatarSrc && (
              <Cropper
                image={avatarSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex items-center gap-4">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">
              缩放
            </Label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAvatarDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleUploadAvatar} disabled={uploading}>
              {uploading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              确认上传
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Basic Info Modal */}
      <BasicInfoUpdateModal
        open={basicInfoOpen}
        onOpenChange={setBasicInfoOpen}
        userInfo={userInfo}
        onSuccess={fetchUserInfo}
      />

      {/* Password Modal */}
      <PasswordModal open={passwordOpen} onOpenChange={setPasswordOpen} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                   */
/* ------------------------------------------------------------------ */

function InfoItem({
  label,
  value,
  className,
}: {
  label: string
  value?: string | null
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm text-foreground">{value || '-'}</p>
    </div>
  )
}

function SecurityRow({
  icon,
  label,
  description,
  bound,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode
  label: string
  description: string
  bound: boolean
  actionLabel: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-muted text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  )
}

function SocialRow({
  icon,
  label,
  bound,
}: {
  icon: React.ReactNode
  label: string
  bound: boolean
}) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-muted text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            {bound ? '已绑定' : '未绑定'}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant={bound ? 'outline' : 'default'}
      >
        {bound ? (
          <>
            <Unlink className="h-3.5 w-3.5 mr-1" />
            解绑
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5 mr-1" />
            绑定
          </>
        )}
      </Button>
    </div>
  )
}
