import { get, post, put, del, patch, download } from '@/apis/http'
import type { PageRes, PageQuery, LabelValueState } from '@/types/api'

export interface UserPageQuery extends PageQuery {
  username?: string
  nickname?: string
  phone?: string
  email?: string
  gender?: number
  status?: number
  deptId?: number
}

export interface User {
  id: number
  username: string
  nickname: string
  gender: number
  email: string
  phone: string
  avatar: string
  status: number
  deptId: number
  deptName: string
  roles: { id: number; name: string }[]
  createTime: string
  updateTime: string
  description: string
}

export function getUserPage(params: UserPageQuery) {
  return get<PageRes<User>>('/system/user', params)
}

export function getUserById(id: number) {
  return get<User>(`/system/user/${id}`)
}

export function addUser(data: Partial<User>) {
  return post('/system/user', data)
}

export function updateUser(id: number, data: Partial<User>) {
  return put(`/system/user/${id}`, data)
}

export function deleteUser(ids: string[]) {
  return del('/system/user', { ids })
}

export function resetPassword(id: number, password: string) {
  return patch(`/system/user/${id}/password`, { password })
}

export function assignRoles(id: number, roleIds: number[]) {
  return patch(`/system/user/${id}/role`, { roleIds })
}

export function getUserDict() {
  return get<LabelValueState[]>('/system/user/dict')
}

export function exportUser(params?: UserPageQuery) {
  return download('/system/user/export', params)
}

export function importUser(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return post('/system/user/import', formData)
}
