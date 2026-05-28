import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface GradientButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit'
}

export function GradientButton({
  children,
  onClick,
  disabled,
  loading,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
}: GradientButtonProps) {
  const variants = {
    primary: 'gradient-primary text-white hover:opacity-90',
    secondary:
      'glass glass-dark dark:glass-dark light:glass-light border-white/20 dark:border-white/20 light:border-black/20',
    ghost: 'bg-transparent hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/10',
  }

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'rounded-xl font-medium transition-all',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
