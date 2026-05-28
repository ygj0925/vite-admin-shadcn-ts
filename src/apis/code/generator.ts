import { get, post } from '@/apis/http'
import http from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface GenConfigResp {
  tableName: string
  comment: string
  moduleName: string
  packageName: string
  businessName: string
  author: string
  tablePrefix: string
  isOverride: boolean
  createTime?: string
  updateTime?: string
  classNamePrefix?: string
}

export interface FieldConfigResp {
  tableName: string
  columnName: string
  columnType: string
  fieldName: string
  fieldType: string
  fieldSort: number
  comment: string
  isRequired: boolean
  showInList: boolean
  showInForm: boolean
  showInQuery: boolean
  formType: string
  queryType: string
  dictCode: string
  createTime?: string
}

export interface GeneratorConfigResp {
  genConfig: GenConfigResp
  fieldConfigs: FieldConfigResp[]
}

export interface GeneratePreviewResp {
  path: string
  fileName: string
  content: string
}

export interface LabelValue {
  label: string
  value: string
}

export function listGenConfig(params: PageQuery) {
  return get<PageRes<GenConfigResp[]>>('/code/generator/config', params)
}

export function getGenConfig(tableName: string) {
  return get<GenConfigResp>(`/code/generator/config/${tableName}`)
}

export function listFieldConfig(tableName: string, requireSync: boolean) {
  return get<FieldConfigResp[]>(`/code/generator/field/${tableName}?requireSync=${requireSync}`)
}

export function listFieldConfigDict() {
  return get<LabelValue[]>('/code/generator/dict')
}

export function saveGenConfig(tableName: string, data: GeneratorConfigResp) {
  return post(`/code/generator/config/${tableName}`, data)
}

export function genPreview(tableNames: string[]) {
  return get<Record<string, string>>(`/code/generator/preview/${tableNames}`)
}

export function generateCode(tableNames: string[]) {
  return http.post(`/code/generator/${tableNames}`, {}, { responseType: 'blob' }).then((res) => res.data)
}

export function downloadCode(tableNames: string[]) {
  return http.post(`/code/generator/${tableNames}/download`, {}, { responseType: 'blob' }).then((res) => res.data)
}
