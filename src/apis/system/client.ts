import { get, post, put, del } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface OAuthClient {
  id: number
  clientId: string
  clientSecret: string
  name: string
  logo: string
  redirectUri: string
  grantTypes: string
  status: number
  description: string
  createTime: string
}

export function getClientPage(params: PageQuery) {
  return get<PageRes<OAuthClient>>('/system/client', params)
}

export function getClientById(id: number) {
  return get<OAuthClient>(`/system/client/${id}`)
}

export function addClient(data: Partial<OAuthClient>) {
  return post('/system/client', data)
}

export function updateClient(id: number, data: Partial<OAuthClient>) {
  return put(`/system/client/${id}`, data)
}

export function deleteClient(ids: string[]) {
  return del('/system/client', { ids })
}
