import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2, ChevronRight } from 'lucide-react'
import { getSocialAuthUrl } from '@/apis/auth'
import { getLoginCorp, setLoginCorp } from '@/lib/auth'

const CORP_NAMES: Record<string, string> = {
  WXCP_PHARMA: '三生制药',
  WXCP_GUOJIAN: '三生国健',
}
const VALID_CORPS = Object.keys(CORP_NAMES)

type PageState = 'loading' | 'select'

export default function CorpSelect() {
  const [searchParams] = useSearchParams()
  const title = import.meta.env.VITE_APP_TITLE || 'ContiNew Admin'

  const [pageState, setPageState] = useState<PageState>('select')
  const [loadingCorp, setLoadingCorp] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [activeCorp, setActiveCorp] = useState<string | null>(null)

  const doOAuthRedirect = async (corp: string) => {
    setErrorMsg('')
    setActiveCorp(corp)
    try {
      const { data } = await getSocialAuthUrl(corp)
      const loginUrl = new URL(data.authorizeUrl)
      const redirect = searchParams.get('redirect')
      if (redirect) {
        loginUrl.searchParams.set('redirect', redirect)
      }
      window.location.replace(loginUrl.toString())
    } catch {
      setErrorMsg('获取登录地址失败，请重试')
      if (pageState !== 'loading') {
        setLoadingCorp(null)
      }
    }
  }

  const handleLogin = (corp: string) => {
    if (loadingCorp) return
    setLoadingCorp(corp)
    setLoginCorp(corp)
    doOAuthRedirect(corp)
  }

  const retry = () => {
    if (activeCorp) {
      setErrorMsg('')
      doOAuthRedirect(activeCorp)
    }
  }

  const switchCorp = () => {
    setErrorMsg('')
    setLoadingCorp(null)
    setActiveCorp(null)
    setPageState('select')
  }

  useEffect(() => {
    const queryCorp = (searchParams.get('corp') || '').toUpperCase()
    const isLogout = searchParams.get('logout') === '1'
    const savedCorp = getLoginCorp()

    if (isLogout && savedCorp && VALID_CORPS.includes(savedCorp)) {
      setPageState('loading')
      doOAuthRedirect(savedCorp)
      return
    }

    if (queryCorp && VALID_CORPS.includes(queryCorp)) {
      setPageState('loading')
      setLoginCorp(queryCorp)
      doOAuthRedirect(queryCorp)
      return
    }

    if (savedCorp && VALID_CORPS.includes(savedCorp)) {
      setPageState('loading')
      doOAuthRedirect(savedCorp)
      return
    }

    setPageState('select')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const corpName = activeCorp ? CORP_NAMES[activeCorp] || '' : ''

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>

      {/* Loading / Error state */}
      {pageState === 'loading' && !errorMsg && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            正在跳转{corpName ? `「${corpName}」` : ''}登录...
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="flex w-full max-w-md flex-col items-center gap-4">
          <div className="w-full rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
            {errorMsg}
          </div>
          <div className="flex gap-3">
            <button
              onClick={retry}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              重试
            </button>
            <button
              onClick={switchCorp}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              切换企业
            </button>
          </div>
        </div>
      )}

      {/* Corp selection */}
      {pageState === 'select' && !errorMsg && (
        <>
          <p className="mb-6 text-sm text-muted-foreground">请选择您所属的企业账号登录</p>
          <div className="flex w-full max-w-md flex-col gap-4">
            {/* 三生制药 */}
            <button
              disabled={!!loadingCorp}
              onClick={() => handleLogin('WXCP_PHARMA')}
              className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary hover:shadow-md active:translate-y-0 disabled:opacity-50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#07c160]">
                <svg viewBox="0 0 48 48" width="28" height="28" fill="none">
                  <path d="M14 24c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10zm10-6.5c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5-2.9-6.5-6.5-6.5z" fill="white" opacity="0.3" />
                  <path d="M24 18v6l4 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="block text-base font-semibold text-foreground">三生制药</span>
                <span className="text-xs text-muted-foreground">企业微信账号登录</span>
              </div>
              {loadingCorp === 'WXCP_PHARMA' ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              )}
            </button>

            {/* 三生国健 */}
            <button
              disabled={!!loadingCorp}
              onClick={() => handleLogin('WXCP_GUOJIAN')}
              className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:border-primary hover:shadow-md active:translate-y-0 disabled:opacity-50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1677ff]">
                <svg viewBox="0 0 48 48" width="28" height="28" fill="none">
                  <path d="M14 24c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10zm10-6.5c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5-2.9-6.5-6.5-6.5z" fill="white" opacity="0.3" />
                  <path d="M24 18v6l4 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="block text-base font-semibold text-foreground">三生国健</span>
                <span className="text-xs text-muted-foreground">企业微信账号登录</span>
              </div>
              {loadingCorp === 'WXCP_GUOJIAN' ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
