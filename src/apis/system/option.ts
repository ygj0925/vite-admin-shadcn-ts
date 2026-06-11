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

export function updateSiteOptions(data: Record<string, any>) {
  return put('/system/option', data)
}

export function getLoginOptions() {
  return get<Record<string, any>>('/system/option', { category: 'LOGIN' })
}

export function updateLoginOptions(data: Record<string, any>) {
  return put('/system/option', data)
}

export function getSecurityOptions() {
  return get<Record<string, string>>('/system/option', { category: 'SECURITY' })
}

export function updateSecurityOptions(data: Record<string, any>) {
  return put('/system/option', data)
}
