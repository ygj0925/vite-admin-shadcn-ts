import { useUserStore } from '@/stores/user'
import { useAuthDialogStore } from '@/stores/auth-dialog'
import { redirectToLogin } from '@/utils/login-redirect'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/**
 * 全局登录失效模态对话框（参考 sss-task-web 的 401 modal 体验）
 * - 不能 ESC 关闭、不能点遮罩关闭：强制用户决策
 * - 点击「重新登录」→ reset state + redirectToLogin(currentPath)
 *
 * 在 App.tsx 顶层挂一份，订阅 useAuthDialogStore
 */
export function LoginExpiredDialog() {
  const open = useAuthDialogStore((s) => s.open)
  const message = useAuthDialogStore((s) => s.message)
  const hide = useAuthDialogStore((s) => s.hide)
  const reset = useUserStore((s) => s.reset)

  const handleConfirm = async () => {
    const currentPath = window.location.pathname + window.location.search
    reset()
    hide()
    await redirectToLogin(currentPath)
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        // 阻止 ESC / 点遮罩关闭：必须点「重新登录」走 redirectToLogin
        {...({
          onEscapeKeyDown: (e: KeyboardEvent) => e.preventDefault(),
          onPointerDownOutside: (e: Event) => e.preventDefault(),
        } as any)}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>提示</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleConfirm}>重新登录</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
