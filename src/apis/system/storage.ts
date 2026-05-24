import { get, put } from '@/apis/http'

export function getStorageConfig() {
  return get<Record<string, string>>('/system/storage')
}

export function updateStorageConfig(data: Record<string, string>) {
  return put('/system/storage', data)
}
