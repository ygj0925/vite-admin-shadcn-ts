import { get, post } from '@/apis/http'

export interface ImageCaptchaResp {
  uuid: string
  img: string
  expireTime: number
  isEnabled: boolean
}

export interface BehaviorCaptchaReq {
  captchaType: string
  captchaVerification?: string
  clientUid?: string
}

export interface BehaviorCaptchaResp {
  originalImageBase64: string
  point: { x: number; y: number }
  jigsawImageBase64: string
  token: string
  secretKey: string
  wordList?: string[]
}

export interface CheckBehaviorCaptchaResp {
  repCode: string
  repMsg: string
}

export function getImageCaptcha() {
  return get<ImageCaptchaResp>('/captcha/image')
}

export function getSmsCaptcha(phone: string, captchaReq: BehaviorCaptchaReq) {
  return get<boolean>('/captcha/sms', { phone, ...captchaReq })
}

export function getEmailCaptcha(email: string, captchaReq: BehaviorCaptchaReq) {
  return get<boolean>('/captcha/mail', { email, ...captchaReq })
}

export function getBehaviorCaptcha(data: BehaviorCaptchaReq) {
  return get<BehaviorCaptchaResp>('/captcha/behavior', data)
}

export function checkBehaviorCaptcha(data: { captchaType: string; pointJson: string; token: string }) {
  return post<CheckBehaviorCaptchaResp>('/captcha/behavior', data)
}
