import type { ReactNode } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface DeleteConfirmProps {
  /** 受控模式：外部管理 open；不传则用 trigger（children）模式 */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  count?: number
  onConfirm: () => void
  title?: string
  description?: string
  /** trigger 模式：把 children 包装成触发按钮 */
  children?: ReactNode
}

export function DeleteConfirm({ open, onOpenChange, count = 1, onConfirm, title, description, children }: DeleteConfirmProps) {
  const defaultDesc = count > 1 ? `确定删除选中的 ${count} 条记录吗？此操作不可恢复。` : '确定删除该记录吗？此操作不可恢复。'
  // 受控模式（传了 open）只用 props 控制；trigger 模式由 AlertDialog 自管理状态
  const isControlled = open !== undefined
  return (
    <AlertDialog open={isControlled ? open : undefined} onOpenChange={onOpenChange}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || '确认删除'}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || defaultDesc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {title ? '确定' : '删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
