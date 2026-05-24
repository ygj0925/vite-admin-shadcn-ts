import { get, download } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface LogEntry {
  id: number
  module: string
  description: string
  requestMethod: string
  requestUrl: string
  requestParams: string
  response: string
  ip: string
  address: string
  browser: string
  os: string
  status: number
  errorMsg: string
  startTime: string
  endTime: string
  duration: number
  createUser: string
  createTime: string
}

export function getLoginLogPage(params: PageQuery) {
  return get<PageRes<LogEntry>>('/system/log', { ...params, type: 'LOGIN' })
}

export function getOperationLogPage(params: PageQuery) {
  return get<PageRes<LogEntry>>('/system/log', { ...params, type: 'OPERATION' })
}

export function getLogById(id: number) {
  return get<LogEntry>(`/system/log/${id}`)
}

export function exportLoginLog() {
  return download('/system/log/export/login')
}

export function exportOperationLog() {
  return download('/system/log/export/operation')
}
