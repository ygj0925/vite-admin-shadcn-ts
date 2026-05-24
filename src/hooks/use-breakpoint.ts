import { useState, useEffect } from 'react'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const

function getBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints.xxl) return 'xxl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return 'xs'
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() =>
    getBreakpoint(window.innerWidth),
  )

  useEffect(() => {
    const queries = Object.entries(breakpoints).map(([key, value]) => ({
      key: key as Breakpoint,
      mql: window.matchMedia(`(min-width: ${value}px)`),
    }))

    const onChange = () => {
      setBreakpoint(getBreakpoint(window.innerWidth))
    }

    queries.forEach(({ mql }) => mql.addEventListener('change', onChange))
    return () => {
      queries.forEach(({ mql }) => mql.removeEventListener('change', onChange))
    }
  }, [])

  return breakpoint
}
