import { get, post } from './http'
import type { LoginResp, UserInfo, RouteItem } from '@/types/api'

interface AccountLoginReq {
  username: string
  password: string
  captcha: string
  uuid: string
  clientId?: string
  authType?: string
}

interface PhoneLoginReq {
  phone: string
  captcha: string
  clientId?: string
  authType?: string
}

interface EmailLoginReq {
  email: string
  captcha: string
  clientId?: string
  authType?: string
}

type LoginReq = AccountLoginReq | PhoneLoginReq | EmailLoginReq

export function login(data: LoginReq) {
  return post<LoginResp>('/auth/login', data)
}

export function getSocialAuthUrl(source: string) {
  return get<{ authorizeUrl: string }>(`/auth/${source}`)
}

export function logout() {
  return post('/auth/logout')
}

export function getUserInfo() {
  return get<UserInfo>('/auth/user/info')
}

export function getUserRoute() {
  return get<RouteItem[]>('/auth/user/route')
}

export function getCaptcha() {
  return get<{ img: string; uuid: string }>('/captcha/image')
}

export function sendSmsCode(phone: string) {
  return post<void>('/auth/sms/code', { phone })
}

export function sendEmailCode(email: string) {
  return post<void>('/auth/email/code', { email })
}
