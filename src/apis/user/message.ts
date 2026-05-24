import { get, patch, del } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface Message {
  id: number
  title: string
  content: string
  type: number
  status: number // 0=未读 1=已读
  createTime: string
}

export function getMessagePage(params: PageQuery) {
  return get<PageRes<Message>>('/user/message', params)
}

export function getMessageById(id: number) {
  return get<Message>(`/user/message/${id}`)
}

export function readMessage(ids: string[]) {
  return patch('/user/message/read', { ids })
}

export function readAllMessages() {
  return patch('/user/message/readAll')
}

export function deleteMessage(ids: string[]) {
  return del('/user/message', { ids })
}
