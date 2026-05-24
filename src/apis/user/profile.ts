import { patch } from '@/apis/http'
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
