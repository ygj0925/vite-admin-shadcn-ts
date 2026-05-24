import { get, post, put, del } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface FileInfo {
  id: number
  name: string
  originalName: string
  path: string
  url: string
  size: number
  type: string
  extension: string
  storageId: number
  storageName: string
  createTime: string
}

export interface FileStatistics {
  total: number
  totalSize: number
  imageCount: number
  videoCount: number
  audioCount: number
  documentCount: number
  otherCount: number
}

export function getFilePage(params: PageQuery) {
  return get<PageRes<FileInfo>>('/system/file', params)
}

export function uploadFile(file: File, onProgress?: (percent: number) => void) {
  const formData = new FormData()
  formData.append('file', file)
  return post<FileInfo>('/system/file/upload', formData)
}

export function updateFile(id: number, data: Partial<FileInfo>) {
  return put(`/system/file/${id}`, data)
}

export function deleteFile(ids: string[]) {
  return del('/system/file', { ids })
}

export function getFileStatistics() {
  return get<FileStatistics>('/system/file/statistics')
}

export function checkFileHash(fileHash: string) {
  return get<{ uploaded: boolean; url?: string }>('/system/file/check', { fileHash })
}
