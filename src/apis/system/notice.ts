import { get, post, put, del } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface Notice {
  id: number
  title: string
  content: string
  type: number // 1=通知 2=公告
  status: number
  startTime: string
  endTime: string
  createTime: string
  updateTime: string
}

export function getNoticePage(params: PageQuery) {
  return get<PageRes<Notice>>('/system/notice', params)
}

export function getNoticeById(id: number) {
  return get<Notice>(`/system/notice/${id}`)
}

export function addNotice(data: Partial<Notice>) {
  return post('/system/notice', data)
}

export function updateNotice(id: number, data: Partial<Notice>) {
  return put(`/system/notice/${id}`, data)
}

export function deleteNotice(ids: string[]) {
  return del('/system/notice', { ids })
}
