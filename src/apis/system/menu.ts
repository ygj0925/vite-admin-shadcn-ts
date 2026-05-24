import { get, post, put, del } from '@/apis/http'
import type { LabelValueState } from '@/types/api'

export interface Menu {
  id: number
  title: string
  parentId: number
  path: string
  component: string
  icon: string
  sort: number
  type: number // 0=目录 1=菜单 2=按钮
  permission: string
  status: number
  cache: boolean
  hidden: boolean
  alwaysShow: boolean
  children?: Menu[]
  createTime: string
  updateTime: string
}

export function getMenuTree() {
  return get<Menu[]>('/system/menu/tree')
}

export function getMenuById(id: number) {
  return get<Menu>(`/system/menu/${id}`)
}

export function addMenu(data: Partial<Menu>) {
  return post('/system/menu', data)
}

export function updateMenu(id: number, data: Partial<Menu>) {
  return put(`/system/menu/${id}`, data)
}

export function deleteMenu(ids: string[]) {
  return del('/system/menu', { ids })
}

export function clearMenuCache() {
  return del('/system/menu/cache')
}

export function getMenuDictTree() {
  return get<LabelValueState[]>('/system/menu/dict/tree')
}
