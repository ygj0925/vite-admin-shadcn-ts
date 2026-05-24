import { get } from '@/apis/http'

export function getTenantIdByDomain(domain: string) {
  return get<string>('/tenant/common/id', { domain })
}
