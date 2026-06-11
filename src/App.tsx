import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppRouter } from '@/app/router'
import { useAppStore } from '@/stores/app'
import { useVersionCheck } from '@/hooks/use-version-check'
import { LoginExpiredDialog } from '@/components/login-expired-dialog'

function App() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    const html = document.documentElement
    // 切换主题时，临时禁用所有过渡动画，避免边框和背景不同步
    html.classList.add('theme-switching')
    html.classList.toggle('dark', theme === 'dark')
    // 下一帧移除，让后续交互的过渡正常工作
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        html.classList.remove('theme-switching')
      })
    })
  }, [theme])

  useVersionCheck()

  return (
    <TooltipProvider delayDuration={200}>
      <AppRouter />
      <LoginExpiredDialog />
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  )
}

export default App
