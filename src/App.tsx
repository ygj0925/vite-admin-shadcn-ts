import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { AppRouter } from '@/app/router'
import { useAppStore } from '@/stores/app'

function App() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <>
      <AppRouter />
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
