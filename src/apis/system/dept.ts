import { get, post, put, del, download } from '@/apis/http'
import type { LabelValueState } from '@/types/api'

export interface Dept {
  id: number
  name: string
  parentId: number
  sort: number
  status: number
  description: string
  leader: string
  phone: string
  email: string
  children?: Dept[]
  createTime: string
  updateTime: string
}

export function getDeptTree() {
  return get<Dept[]>('/system/dept/tree')
}

export function getDeptById(id: number) {
  return get<Dept>(`/system/dept/${id}`)
}

export function addDept(data: Partial<Dept>) {
  return post('/system/dept', data)
}

export function updateDept(id: number, data: Partial<Dept>) {
  return put(`/system/dept/${id}`, data)
}

export function deleteDept(ids: string[]) {
  return del('/system/dept', { ids })
}

export function exportDept() {
  return download('/system/dept/export')
}

export function getDeptDictTree() {
  return get<LabelValueState[]>('/system/dept/dict/tree')
}
