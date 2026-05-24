import { get, post, put, del } from '@/apis/http'
import type { PageRes, PageQuery, LabelValueState } from '@/types/api'

export interface Dict {
  id: number
  name: string
  code: string
  status: number
  description: string
  createTime: string
  updateTime: string
}

export interface DictItem {
  id: number
  label: string
  value: string
  dictCode: string
  sort: number
  status: number
  description: string
  color: string
  cssClass: string
  createTime: string
}

export function getDictPage(params: PageQuery) {
  return get<PageRes<Dict>>('/system/dict', params)
}

export function getDictById(id: number) {
  return get<Dict>(`/system/dict/${id}`)
}

export function addDict(data: Partial<Dict>) {
  return post('/system/dict', data)
}

export function updateDict(id: number, data: Partial<Dict>) {
  return put(`/system/dict/${id}`, data)
}

export function deleteDict(ids: string[]) {
  return del('/system/dict', { ids })
}

export function clearDictCache(code: string) {
  return del(`/system/dict/cache/${code}`)
}

export function getDictItemPage(dictCode: string, params: PageQuery) {
  return get<PageRes<DictItem>>('/system/dict/item', { ...params, dictCode })
}

export function addDictItem(data: Partial<DictItem>) {
  return post('/system/dict/item', data)
}

export function updateDictItem(id: number, data: Partial<DictItem>) {
  return put(`/system/dict/item/${id}`, data)
}

export function deleteDictItem(ids: string[]) {
  return del('/system/dict/item', { ids })
}

export function getDictByCode(code: string) {
  return get<LabelValueState[]>(`/system/dict/item/${code}`)
}
