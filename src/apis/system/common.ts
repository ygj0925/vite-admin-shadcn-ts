import { get, put } from '@/apis/http'

export function getMailConfig() {
  return get<Record<string, string>>('/system/option', { category: 'MAIL' })
}

export function updateMailConfig(data: any[]) {
  return put('/system/option', data)
}
