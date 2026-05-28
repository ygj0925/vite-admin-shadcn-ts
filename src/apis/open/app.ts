import { get, post, put, del, patch } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface OpenApp {
  id: number
  name: string
  accessKey: string
  secretKey: string
  status: number
  description: string
  expireTime?: string
  createUserString?: string
  updateUserString?: string
  createTime: string
  updateTime?: string
}

export function getAppPage(params: PageQuery) {
  return get<PageRes<OpenApp>>('/open/app', params)
}

export function getAppById(id: number) {
  return get<OpenApp>(`/open/app/${id}`)
}

export function addApp(data: Partial<OpenApp>) {
  return post('/open/app', data)
}

export function updateApp(id: number, data: Partial<OpenApp>) {
  return put(`/open/app/${id}`, data)
}

export function deleteApp(ids: string[]) {
  return del('/open/app', { ids })
}

export function getAppSecret(id: number) {
  return get<string>(`/open/app/${id}/secret`)
}

export function resetAppSecret(id: number) {
  return patch(`/open/app/${id}/secret`)
}

export function exportApp() {
  return post('/open/app/export', {}, { responseType: 'blob' })
}
