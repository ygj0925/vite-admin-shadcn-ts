import { get } from '@/apis/http'

export interface AreaItem {
  label: string
  code: string
  children?: AreaItem[]
}

export function listArea(params: { type: 'province' | 'city' | 'area'; code?: string }) {
  return get<AreaItem[]>('/area/list', params)
}
