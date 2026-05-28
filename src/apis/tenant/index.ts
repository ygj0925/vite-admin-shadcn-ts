import { get, post, put, del } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface Tenant {
  id: number
  name: string
  code: string
  domain?: string
  status: number
  contactName: string
  contactPhone: string
  contactEmail: string
  packageName: string
  packageId: number
  expireTime?: string
  accountLimit: number
  description: string
  adminUsername?: string
  createUserString?: string
  updateUserString?: string
  createTime: string
  updateTime?: string
}

export function getTenantPage(params: PageQuery) {
  return get<PageRes<Tenant>>('/tenant/management', params)
}

export function getTenantById(id: number) {
  return get<Tenant>(`/tenant/management/${id}`)
}

export function addTenant(data: Partial<Tenant> & { adminPassword?: string }) {
  return post('/tenant/management', data)
}

export function updateTenant(id: number, data: Partial<Tenant>) {
  return put(`/tenant/management/${id}`, data)
}

export function deleteTenant(id: number) {
  return del(`/tenant/management/${id}`)
}

export function resetTenantAdminPwd(id: number, data: { password: string }) {
  return put(`/tenant/management/${id}/admin/pwd`, data)
}
