import { get, put } from '@/apis/http'

export function getMailConfig() {
  return get<Record<string, any>>('/system/option', { category: 'MAIL' })
}

export function updateMailConfig(data: Record<string, any>) {
  return put('/system/option', data)
}
