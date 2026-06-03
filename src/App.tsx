import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppRouter } from '@/app/router'
import { useAppStore } from '@/stores/app'
import { useVersionCheck } from '@/hooks/use-version-check'

function App() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useVersionCheck()

  return (
    <TooltipProvider delayDuration={200}>
      <AppRouter />
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  )
}

export default App
