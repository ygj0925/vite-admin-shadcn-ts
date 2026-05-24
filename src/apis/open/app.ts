import { get, post, put, del } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface OpenApp {
  id: number
  name: string
  appId: string
  appSecret: string
  status: number
  description: string
  createTime: string
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
