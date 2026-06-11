import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'

export interface FormField {
  name: string
  label: string
  // type 缺省时按 'input' 处理（最常见场景）
  type?: 'input' | 'textarea' | 'select' | 'switch' | 'number' | 'password' | 'date'
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string | number }[]
  rows?: number
  disabled?: boolean
  hidden?: boolean
  span?: number
}

interface CrudFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fields: FormField[]
  // 接受任意 object，内部用作只读快照
  values?: Record<string, any>
  /** values 的别名，部分调用方用 initialValues */
  initialValues?: Record<string, any>
  loading?: boolean
  onSubmit: (values: Record<string, unknown>) => void
  width?: string
}

export function CrudForm({
  open,
  onOpenChange,
  title,
  fields,
  values,
  initialValues,
  loading,
  onSubmit,
  width = 'max-w-lg',
}: CrudFormProps) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const effectiveValues = values ?? initialValues

  useEffect(() => {
    if (open) {
      setFormValues(effectiveValues || {})
    }
  }, [open, effectiveValues])

  const handleChange = (name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Check required fields
    for (const field of fields) {
      if (field.required && !field.hidden) {
        const val = formValues[field.name]
        if (val === undefined || val === null || val === '') {
          return
        }
      }
    }
    onSubmit(formValues)
  }

  const visibleFields = fields.filter((f) => !f.hidden)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={width}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid gap-4" style={{ gridTemplateColumns: visibleFields.some((f) => f.span === 2) ? 'repeat(2, 1fr)' : '1fr' }}>
            {visibleFields.map((field) => {
              const fieldType = field.type ?? 'input'
              return (
              <div key={field.name} className="space-y-1.5" style={{ gridColumn: field.span === 2 ? 'span 2' : undefined }}>
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
                {fieldType === 'input' || fieldType === 'password' ? (
                  <Input
                    id={field.name}
                    type={fieldType}
                    placeholder={field.placeholder}
                    value={String(formValues[field.name] || '')}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    disabled={field.disabled}
                  />
                ) : fieldType === 'number' ? (
                  <Input
                    id={field.name}
                    type="number"
                    placeholder={field.placeholder}
                    value={String(formValues[field.name] || '')}
                    onChange={(e) => handleChange(field.name, Number(e.target.value))}
                    disabled={field.disabled}
                  />
                ) : fieldType === 'date' ? (
                  <Input
                    id={field.name}
                    type="date"
                    placeholder={field.placeholder}
                    value={String(formValues[field.name] || '')}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    disabled={field.disabled}
                  />
                ) : fieldType === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    value={String(formValues[field.name] || '')}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={field.rows || 3}
                    disabled={field.disabled}
                  />
                ) : fieldType === 'select' ? (
                  <Select value={String(formValues[field.name] || '')} onValueChange={(v) => handleChange(field.name, v)} disabled={field.disabled}>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : fieldType === 'switch' ? (
                  <Switch
                    checked={!!formValues[field.name]}
                    onCheckedChange={(v) => handleChange(field.name, v)}
                    disabled={field.disabled}
                  />
                ) : null}
              </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确定
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
