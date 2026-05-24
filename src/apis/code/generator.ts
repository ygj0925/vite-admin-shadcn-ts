import { get, post, download } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface TableInfo {
  tableName: string
  tableComment: string
  engine: string
  createTime: string
  updateTime: string
}

export function getTablePage(params: PageQuery) {
  return get<PageRes<TableInfo>>('/code/generator', params)
}

export function previewCode(tableName: string) {
  return get<Record<string, string>>(`/code/generator/preview/${tableName}`)
}

export function generateCode(tableName: string) {
  return download(`/code/generator/generate/${tableName}`)
}

export function batchGenerateCode(tableNames: string[]) {
  return download('/code/generator/generate', { tableNames })
}
