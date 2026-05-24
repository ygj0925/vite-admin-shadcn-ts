import { create } from 'zustand'

interface TenantState {
  tenantId: number | null
  enabled: boolean
  code: string | null
  setTenantId: (id: number) => void
  setEnabled: (enabled: boolean) => void
  setCode: (code: string) => void
  reset: () => void
}

export const useTenantStore = create<TenantState>()((set) => ({
  tenantId: null,
  enabled: false,
  code: null,

  setTenantId: (tenantId) => set({ tenantId }),
  setEnabled: (enabled) => set({ enabled }),
  setCode: (code) => set({ code }),
  reset: () => set({ tenantId: null, enabled: false, code: null }),
}))
