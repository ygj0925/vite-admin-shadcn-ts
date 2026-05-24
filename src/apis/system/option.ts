import { get, put } from '@/apis/http'

export interface SiteOption {
  siteName: string
  siteUrl: string
  logo: string
  copyright: string
  icp: string
  [key: string]: string
}

export function getSiteOptions() {
  return get<Record<string, string>>('/system/option', { category: 'SITE' })
}

export function updateSiteOptions(data: any[]) {
  return put('/system/option', data)
}

export function getLoginOptions() {
  return get<Record<string, string>>('/system/option', { category: 'LOGIN' })
}

export function updateLoginOptions(data: any[]) {
  return put('/system/option', data)
}

export function getSecurityOptions() {
  return get<Record<string, string>>('/system/option', { category: 'SECURITY' })
}

export function updateSecurityOptions(data: any[]) {
  return put('/system/option', data)
}
