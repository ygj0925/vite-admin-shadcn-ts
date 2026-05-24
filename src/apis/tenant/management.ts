import { get, post, put, del } from '@/apis/http'

export interface TenantResp {
  id: string
  name: string
  code: string
  domain?: string
  status: number
  contactName?: string
  contactPhone?: string
  packageName?: string
  packageId?: string
  accountLimit: number
  expireTime?: string
  createTime?: string
}

export interface TenantReq {
  name: string
  code: string
  domain?: string
  contactName?: string
  contactPhone?: string
  packageId?: string
  accountLimit?: number
  expireTime?: string
  status?: number
}

export function listTenant(params?: any) {
  return get<{ list: TenantResp[]; total: number }>('/tenant/management', params)
}

export function getTenant(id: string) {
  return get<TenantResp>(`/tenant/management/${id}`)
}

export function addTenant(data: TenantReq) {
  return post<void>('/tenant/management', data)
}

export function updateTenant(id: string, data: TenantReq) {
  return put<void>(`/tenant/management/${id}`, data)
}

export function deleteTenant(id: string) {
  return del<void>(`/tenant/management/${id}`)
}

export function updateTenantAdminUserPwd(id: string) {
  return put<void>(`/tenant/management/${id}/admin/pwd`)
}
