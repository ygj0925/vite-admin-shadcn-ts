import { get, post, put, del } from '@/apis/http'
import type { PageRes, PageQuery, LabelValueState } from '@/types/api'

export interface RolePageQuery extends PageQuery {
  name?: string
  status?: number
}

export interface Role {
  id: number
  name: string
  code: string
  status: number
  sort: number
  description: string
  permissions: string[]
  createTime: string
  updateTime: string
}

export function getRolePage(params: RolePageQuery) {
  return get<PageRes<Role>>('/system/role', params)
}

export function getRoleById(id: number) {
  return get<Role>(`/system/role/${id}`)
}

export function addRole(data: Partial<Role>) {
  return post('/system/role', data)
}

export function updateRole(id: number, data: Partial<Role>) {
  return put(`/system/role/${id}`, data)
}

export function deleteRole(ids: string[]) {
  return del('/system/role', { ids })
}

export function getPermissionTree() {
  return get<any[]>('/system/role/permission/tree')
}

export function updatePermission(id: number, permissions: string[]) {
  return put(`/system/role/${id}/permission`, { permissions })
}

export function getRoleUserPage(id: number, params: PageQuery) {
  return get<PageRes<any>>(`/system/role/${id}/user`, params)
}

export function assignUsers(id: number, userIds: number[]) {
  return post(`/system/role/${id}/user`, { userIds })
}

export function unassignUsers(id: number, userIds: number[]) {
  return del('/system/role/user', { id, userIds })
}

export function getRoleDict() {
  return get<LabelValueState[]>('/system/role/dict')
}
