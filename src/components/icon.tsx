import { type LucideProps, icons } from 'lucide-react'

interface IconProps extends LucideProps {
  name: string
}

export function Icon({ name, ...props }: IconProps) {
  const LucideIcon = icons[name as keyof typeof icons]
  if (!LucideIcon) return null
  return <LucideIcon {...props} />
}
