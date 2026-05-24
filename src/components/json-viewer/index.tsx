import { useCallback, useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app'

interface JsonViewerProps {
  json: string | object
  className?: string
}

function getColors(isDark: boolean) {
  return {
    key: isDark ? '#c792ea' : '#7c3aed',
    string: isDark ? '#c3e88d' : '#16a34a',
    number: isDark ? '#f78c6c' : '#ea580c',
    boolean: isDark ? '#ff5370' : '#dc2626',
    null: isDark ? '#636d83' : '#9ca3af',
    bracket: isDark ? '#89ddff' : '#374151',
    colon: isDark ? '#89ddff' : '#6b7280',
  }
}

function JsonNode({
  keyName,
  value,
  isLast,
  depth,
  colors,
}: {
  keyName?: string
  value: unknown
  isLast: boolean
  depth: number
  colors: ReturnType<typeof getColors>
}) {
  const indent = depth * 16

  if (value === null) {
    return (
      <div style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <>
            <span style={{ color: colors.key }}>"{keyName}"</span>
            <span style={{ color: colors.colon }}>: </span>
          </>
        )}
        <span style={{ color: colors.null }}>null</span>
        {!isLast && <span style={{ color: colors.bracket }}>,</span>}
      </div>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <div style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <>
            <span style={{ color: colors.key }}>"{keyName}"</span>
            <span style={{ color: colors.colon }}>: </span>
          </>
        )}
        <span style={{ color: colors.boolean }}>{String(value)}</span>
        {!isLast && <span style={{ color: colors.bracket }}>,</span>}
      </div>
    )
  }

  if (typeof value === 'number') {
    return (
      <div style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <>
            <span style={{ color: colors.key }}>"{keyName}"</span>
            <span style={{ color: colors.colon }}>: </span>
          </>
        )}
        <span style={{ color: colors.number }}>{value}</span>
        {!isLast && <span style={{ color: colors.bracket }}>,</span>}
      </div>
    )
  }

  if (typeof value === 'string') {
    return (
      <div style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <>
            <span style={{ color: colors.key }}>"{keyName}"</span>
            <span style={{ color: colors.colon }}>: </span>
          </>
        )}
        <span style={{ color: colors.string }}>"{value}"</span>
        {!isLast && <span style={{ color: colors.bracket }}>,</span>}
      </div>
    )
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div style={{ paddingLeft: indent }}>
          {keyName !== undefined && (
            <>
              <span style={{ color: colors.key }}>"{keyName}"</span>
              <span style={{ color: colors.colon }}>: </span>
            </>
          )}
          <span style={{ color: colors.bracket }}>[]</span>
          {!isLast && <span style={{ color: colors.bracket }}>,</span>}
        </div>
      )
    }
    return (
      <div style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <>
            <span style={{ color: colors.key }}>"{keyName}"</span>
            <span style={{ color: colors.colon }}>: </span>
          </>
        )}
        <span style={{ color: colors.bracket }}>[</span>
        {value.map((item, index) => (
          <JsonNode
            key={index}
            value={item}
            isLast={index === value.length - 1}
            depth={depth + 1}
            colors={colors}
          />
        ))}
        <div style={{ paddingLeft: 0 }}>
          <span style={{ color: colors.bracket }}>]</span>
          {!isLast && <span style={{ color: colors.bracket }}>,</span>}
        </div>
      </div>
    )
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) {
      return (
        <div style={{ paddingLeft: indent }}>
          {keyName !== undefined && (
            <>
              <span style={{ color: colors.key }}>"{keyName}"</span>
              <span style={{ color: colors.colon }}>: </span>
            </>
          )}
          <span style={{ color: colors.bracket }}>{'{}'}</span>
          {!isLast && <span style={{ color: colors.bracket }}>,</span>}
        </div>
      )
    }
    return (
      <div style={{ paddingLeft: indent }}>
        {keyName !== undefined && (
          <>
            <span style={{ color: colors.key }}>"{keyName}"</span>
            <span style={{ color: colors.colon }}>: </span>
          </>
        )}
        <span style={{ color: colors.bracket }}>{'{'}</span>
        {entries.map(([k, v], index) => (
          <JsonNode
            key={k}
            keyName={k}
            value={v}
            isLast={index === entries.length - 1}
            depth={depth + 1}
            colors={colors}
          />
        ))}
        <div style={{ paddingLeft: 0 }}>
          <span style={{ color: colors.bracket }}>{'}'}</span>
          {!isLast && <span style={{ color: colors.bracket }}>,</span>}
        </div>
      </div>
    )
  }

  return null
}

export function JsonViewer({ json, className }: JsonViewerProps) {
  const [copied, setCopied] = useState(false)
  const theme = useAppStore((s) => s.theme)

  const parsed = useMemo(() => {
    if (typeof json === 'string') {
      try {
        return JSON.parse(json)
      } catch {
        return null
      }
    }
    return json
  }, [json])

  const formatted = useMemo(() => {
    if (parsed === null) return typeof json === 'string' ? json : ''
    return JSON.stringify(parsed, null, 2)
  }, [parsed, json])

  const colors = useMemo(() => getColors(theme === 'dark'), [theme])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formatted)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = formatted
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [formatted])

  if (parsed === null && typeof json === 'string') {
    return (
      <div className={cn('relative rounded-md border bg-muted/30', className)}>
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2 z-10"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
        <ScrollArea className="max-h-[400px]">
          <pre className="p-4 text-sm whitespace-pre-wrap">{json}</pre>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-md border bg-muted/30', className)}>
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2 z-10"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <ScrollArea className="max-h-[400px]">
        <div className="p-4 font-mono text-sm">
          <JsonNode value={parsed} isLast depth={0} colors={colors} />
        </div>
      </ScrollArea>
    </div>
  )
}
