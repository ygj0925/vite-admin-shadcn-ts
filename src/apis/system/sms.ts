import { get, put } from '@/apis/http'

export function getSmsConfig() {
  return get<Record<string, string>>('/system/sms/config')
}

export function updateSmsConfig(data: Record<string, string>) {
  return put('/system/sms/config', data)
}
