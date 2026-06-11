import { create } from 'zustand'

/**
 * 全局登录失效模态对话框状态
 *
 * 拦截器是普通函数（不能用 hooks），LoginExpiredDialog 是组件
 * → 用 Zustand store 当桥梁，拦截器调 showLoginExpiredDialog，
 *   Dialog 订阅 store 决定渲染
 *
 * 哨兵 open 字段同时也作为"已经在显示"的去重信号：
 * 并发的多个 401 只会触发第一个，后面的 show() 命中 open===true 跳过
 */
interface AuthDialogState {
  open: boolean
  message: string
  show: (message?: string) => void
  hide: () => void
}

const DEFAULT_MESSAGE = '登录已失效，请重新登录'

export const useAuthDialogStore = create<AuthDialogState>((set, get) => ({
  open: false,
  message: DEFAULT_MESSAGE,

  show: (message) => {
    if (get().open) return
    set({ open: true, message: message?.trim() || DEFAULT_MESSAGE })
  },

  hide: () => set({ open: false }),
}))

/** 非 React 代码调用 —— 拦截器用 */
export function showLoginExpiredDialog(message?: string): void {
  useAuthDialogStore.getState().show(message)
}
