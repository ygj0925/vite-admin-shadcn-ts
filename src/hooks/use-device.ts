import { useState, useEffect } from 'react'

export function useDevice() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 571)

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 572px)')
    const onChange = () => {
      setIsDesktop(window.innerWidth > 571)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return { isDesktop, isMobile: !isDesktop }
}
