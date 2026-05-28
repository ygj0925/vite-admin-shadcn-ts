import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface PromptPanelProps {
  prompts: string[]
  onSelect: (prompt: string) => void
  visible: boolean
}

export function PromptPanel({ prompts, onSelect, visible }: PromptPanelProps) {
  if (!visible) return null

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs">快捷提示</span>
      </div>
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {prompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSelect(prompt)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm transition-all',
              'glass glass-dark dark:glass-dark light:glass-light',
              'hover:scale-105 hover:shadow-lg',
              'text-muted-foreground hover:text-foreground'
            )}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
