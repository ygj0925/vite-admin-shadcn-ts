/** 运行环境判断（浏览器 / 企业微信 / 普通微信，PC / 移动） */
export function envjudge(): 'other' | 'com-wx-mobile' | 'com-wx-pc' | 'wx-mobile' | 'wx-pc' {
  if (typeof window === 'undefined') {
    return 'other'
  }
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isMobile =
    /(phone|iphone|ipod|ios|android|mobile|blackberry|iemobile|windows phone)/i.test(userAgent) &&
    !/(ipad|tablet)/i.test(userAgent)
  const isComWx = /wxwork/i.test(userAgent)
  const isWx = !isComWx && /micromessenger/i.test(userAgent)
  if (isComWx) {
    return isMobile ? 'com-wx-mobile' : 'com-wx-pc'
  } else if (isWx) {
    return isMobile ? 'wx-mobile' : 'wx-pc'
  } else {
    return 'other'
  }
}
