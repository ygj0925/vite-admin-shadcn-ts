import { get, post, put, del } from '@/apis/http'
import type { PageRes, PageQuery, LabelValueState } from '@/types/api'

export interface RolePageQuery extends PageQuery {
  name?: string
  status?: number
}

export interface Role {
  id: number
  name: string
  code: string
  status: number
  sort: number
  description: string
  permissions: string[]
  createTime: string
  updateTime: string
}

export function getRolePage(params: RolePageQuery) {
  return get<Role[]>('/system/role/list', { sort: ['sort,asc'] }).then((res) => {
    // 后端返回全量列表，客户端分页
    const list = res.data ?? []
    const page = params.page ?? 1
    const size = params.size ?? 10
    // 按搜索条件过滤
    const filtered = list.filter((item) => {
      if (params.name && !item.name.includes(params.name)) return false
      if (params.status !== undefined && item.status !== params.status) return false
      return true
    })
    const start = (page - 1) * size
    return {
      data: { list: filtered.slice(start, start + size), total: filtered.length },
    } as { data: PageRes<Role> }
  })
}

export function getRoleById(id: number) {
  return get<Role>(`/system/role/${id}`)
}

export function addRole(data: Partial<Role>) {
  return post('/system/role', data)
}

export function updateRole(id: number, data: Partial<Role>) {
  return put(`/system/role/${id}`, data)
}

export function deleteRole(ids: string[]) {
  return del('/system/role', { ids })
}

export function getPermissionTree() {
  return get<any[]>('/system/role/permission/tree')
}

export function updatePermission(id: number, menuIds: string[], menuCheckStrictly = true) {
  return put(`/system/role/${id}/permission`, { menuIds, menuCheckStrictly })
}

export function getRoleUserPage(id: number, params: PageQuery) {
  return get<PageRes<any>>(`/system/role/${id}/user`, params)
}

export function assignUsers(id: number, userIds: number[]) {
  return post(`/system/role/${id}/user`, { userIds })
}

export function unassignUsers(id: number, userIds: number[]) {
  return del('/system/role/user', { id, userIds })
}

export function getRoleDict() {
  return get<LabelValueState[]>('/system/role/dict')
}
