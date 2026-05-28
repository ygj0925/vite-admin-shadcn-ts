import { get } from '@/apis/http'

export interface DashboardNotice {
  id: number
  title: string
  type: number
  isTop: boolean
}

export interface DashboardAccessTrend {
  date: string
  pvCount: number
  ipCount: number
}

export interface DashboardOverview {
  total: number
  today: number
  growth: number
  dataList: DashboardChartItem[]
}

export interface DashboardChartItem {
  name: string
  value: number
}

export function getDashboardNotice() {
  return get<DashboardNotice[]>('/dashboard/notice')
}

export function getDashboardOverviewPv() {
  return get<DashboardOverview>('/dashboard/analysis/overview/pv')
}

export function getDashboardOverviewIp() {
  return get<DashboardOverview>('/dashboard/analysis/overview/ip')
}

export function getAccessTrend(days: number = 7) {
  return get<DashboardAccessTrend[]>(`/dashboard/access/trend/${days}`)
}

export function getAnalysisGeo() {
  return get<DashboardChartItem[]>('/dashboard/analysis/geo')
}

export function getAnalysisTimeslot() {
  return get<DashboardChartItem[]>('/dashboard/analysis/timeslot')
}

export function getAnalysisModule() {
  return get<DashboardChartItem[]>('/dashboard/analysis/module')
}

export function getAnalysisOs() {
  return get<DashboardChartItem[]>('/dashboard/analysis/os')
}

export function getAnalysisBrowser() {
  return get<DashboardChartItem[]>('/dashboard/analysis/browser')
}
