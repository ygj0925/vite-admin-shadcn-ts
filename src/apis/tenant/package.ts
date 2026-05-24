import { get, post, put, del } from '@/apis/http'
import type { PageRes, PageQuery, LabelValueState } from '@/types/api'

export interface TenantPackage {
  id: number
  name: string
  status: number
  menuIds: number[]
  description: string
  createTime: string
}

export function getPackagePage(params: PageQuery) {
  return get<PageRes<TenantPackage>>('/tenant/package', params)
}

export function getPackageById(id: number) {
  return get<TenantPackage>(`/tenant/package/${id}`)
}

export function addPackage(data: Partial<TenantPackage>) {
  return post('/tenant/package', data)
}

export function updatePackage(id: number, data: Partial<TenantPackage>) {
  return put(`/tenant/package/${id}`, data)
}

export function deletePackage(id: number) {
  return del(`/tenant/package/${id}`)
}

export function getPackageDict() {
  return get<LabelValueState[]>('/tenant/package/dict')
}

export function getPackageMenuTree() {
  return get<any[]>('/tenant/package/menu/tree')
}
