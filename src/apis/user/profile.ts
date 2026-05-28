import { get, patch, post, del } from '@/apis/http'
import type { UserInfo } from '@/types/api'

export function updateProfile(data: Partial<UserInfo>) {
  return patch('/user/profile/basic/info', data)
}

export function updatePassword(data: { oldPassword: string; newPassword: string }) {
  return patch('/user/profile/password', data)
}

export function updateAvatar(avatar: string) {
  return patch('/user/profile/avatar', { avatar })
}

export function updatePhone(data: { phone: string; captcha: string; oldPassword: string }) {
  return patch('/user/profile/phone', data)
}

export function updateEmail(data: { email: string; captcha: string; oldPassword: string }) {
  return patch('/user/profile/email', data)
}

export interface SocialAccount {
  source: string
  socialUuid: string
  socialNickname: string
}

export function listUserSocial() {
  return get<SocialAccount[]>('/user/profile/social')
}

export function bindSocialAccount(source: string, data: any) {
  return post(`/user/profile/social/${source}`, data)
}

export function unbindSocialAccount(source: string) {
  return del(`/user/profile/social/${source}`)
}
