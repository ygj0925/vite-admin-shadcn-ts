import { create } from 'zustand'
import { get } from '@/apis/http'
import type { LabelValueState } from '@/types/api'

interface DictState {
  cache: Record<string, LabelValueState[]>
  fetchDict: (code: string) => Promise<LabelValueState[]>
  getDict: (code: string) => LabelValueState[] | undefined
  clearCache: (code?: string) => void
}

export const useDictStore = create<DictState>()((set, get) => ({
  cache: {},

  fetchDict: async (code) => {
    const existing = get().cache[code]
    if (existing) return existing
    const res = await get<LabelValueState[]>(`/system/dict/item/${code}`)
    const data = res.data || []
    set((s) => ({ cache: { ...s.cache, [code]: data } }))
    return data
  },

  getDict: (code) => get().cache[code],

  clearCache: (code) => {
    if (code) {
      set((s) => {
        const next = { ...s.cache }
        delete next[code]
        return { cache: next }
      })
    } else {
      set({ cache: {} })
    }
  },
}))
