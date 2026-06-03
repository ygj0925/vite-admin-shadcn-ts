import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getSocialAuthUrl } from '@/apis/auth'
import { useUserStore } from '@/stores/user'
import { useTabsStore } from '@/stores/tabs'
import { envjudge } from '@/utils/env'

export default function SocialCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const socialLogin = useUserStore((s) => s.socialLogin)
  const closeAllTabs = useTabsStore((s) => s.closeAllTabs)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const source = searchParams.get('source')
    const token = searchParams.get('token')

    // Case 1: Token directly provided (legacy flow)
    if (token) {
      useUserStore.getState().setToken(token)
      navigate('/', { replace: true })
      return
    }

    // Case 2: OAuth flow with source + code
    if (source) {
      const { redirect, source: _s, ...othersQuery } = Object.fromEntries(searchParams.entries())
      socialLogin(source, othersQuery)
        .then(() => {
          closeAllTabs()
          toast.success('欢迎使用')
          navigate(redirect || '/', { replace: true })
        })
        .catch(() => {
          const env = envjudge()
          if (!import.meta.env.PROD) {
            navigate('/login', { replace: true })
          } else if (env === 'other') {
            getSocialAuthUrl('sso')
              .then(({ data }) => {
                window.location.replace(data.authorizeUrl)
              })
              .catch(() => {
                navigate('/corp-select', { replace: true })
              })
          } else {
            navigate('/corp-select', { replace: true })
          }
        })
        .finally(() => setLoading(false))
      return
    }

    // Case 3: No token and no source — redirect to login
    navigate('/login', { replace: true })
  }, [searchParams, socialLogin, closeAllTabs, navigate])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        {loading && <p className="text-sm text-muted-foreground">登录中...</p>}
      </div>
    </div>
  )
}
