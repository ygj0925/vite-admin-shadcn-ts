import { get, del } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface OnlineUser {
  id: string
  token: string
  username: string
  nickname: string
  ip: string
  address: string
  browser: string
  os: string
  loginTime: string
}

export function getOnlineUserPage(params: PageQuery) {
  return get<PageRes<OnlineUser>>('/monitor/online', params)
}

export function kickoutOnlineUser(token: string) {
  return del(`/monitor/online/${token}`)
}
