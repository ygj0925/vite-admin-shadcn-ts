export interface ApiRes<T> {
  code: number
  data: T
  msg: string
  success: boolean
  timestamp: string
}

export interface PageRes<T> {
  list: T[]
  total: number
}

export interface PageQuery {
  page: number
  size: number
  sort?: string[]
}

export interface LabelValueState {
  label: string
  value: string | number
  children?: LabelValueState[]
}

export interface RouteItem {
  id?: number
  parentId?: number
  path: string
  name?: string
  component: string
  redirect?: string
  title?: string
  icon?: string
  isHidden?: boolean
  isCache?: boolean
  isExternal?: boolean
  sort?: number
  // 兼容旧 meta 结构
  meta?: {
    title?: string
    icon?: string
    hidden?: boolean
    alwaysShow?: boolean
    affix?: boolean
    cache?: boolean
    badge?: string
  }
  children?: RouteItem[]
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  gender: number
  email: string
  phone: string
  avatar: string
  roles: string[]
  roleNames: string[]
  permissions: string[]
}

export interface LoginResp {
  token: string
  tenantId: number
}
