import { get } from '@/apis/http'

export interface DashboardOverview {
  userCount: number
  roleCount: number
  menuCount: number
  onlineCount: number
}

export interface AccessTrend {
  date: string
  count: number
}

export function getDashboardOverviewPv() {
  return get<{ todayCount: number; yesterdayCount: number; thisWeekCount: number }>('/dashboard/analysis/overview/pv')
}

export function getDashboardOverviewIp() {
  return get<{ todayCount: number; yesterdayCount: number; thisWeekCount: number }>('/dashboard/analysis/overview/ip')
}

export function getAccessTrend(days: number = 7) {
  return get<AccessTrend[]>(`/dashboard/access/trend/${days}`)
}

export function getDashboardNotice() {
  return get<any[]>('/dashboard/notice')
}
