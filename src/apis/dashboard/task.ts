import { get, post, put, del } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface TaskItem {
  id: number
  code: string
  title: string
  description: string
  status: string
  priority: string
  categoryId: number
  categoryName: string
  startDate: string
  dueDate: string
  progress: number
  isOverdue: boolean
  owners: { id: number; nickname: string; avatar: string }[]
  categories: { id: number; name: string }[]
  latestProgress: string
  createTime: string
  updateTime: string
}

export interface TaskCategory {
  id: number
  name: string
  code: string
  status: number
  sort: number
  description: string
  taskCount: number
  createTime: string
  updateTime: string
}

export interface TaskStats {
  total: number
  inProgress: number
  completed: number
  atRisk: number
  blocked: number
  overdue: number
}

export interface TaskQuery extends PageQuery {
  keyword?: string
  status?: string[]
  priority?: string[]
  categoryId?: number
  overdue?: boolean
  authorized?: boolean
}

// --- Task Items ---

export function listTaskItems(params: TaskQuery) {
  return get<PageRes<TaskItem>>('/task/items', params as Record<string, unknown>)
}

export function getTaskItem(id: number) {
  return get<TaskItem>(`/task/items/${id}`)
}

export function createTaskItem(data: Partial<TaskItem>) {
  return post('/task/items', data)
}

export function updateTaskItem(id: number, data: Partial<TaskItem>) {
  return put(`/task/items/${id}`, data)
}

export function deleteTaskItem(id: number) {
  return del(`/task/items/${id}`)
}

export function getTaskStats(params?: Record<string, unknown>) {
  return get<TaskStats>('/task/items/stats', params)
}

export function listTaskOwners() {
  return get<{ id: number; nickname: string }[]>('/task/items/owners')
}

// --- Task Categories ---

export function listTaskCategories() {
  return get<TaskCategory[]>('/task/categories')
}

export function listTaskCategoriesPermitted() {
  return get<TaskCategory[]>('/task/categories/permitted')
}

export function createTaskCategory(data: Partial<TaskCategory>) {
  return post('/task/categories', data)
}

export function updateTaskCategory(id: number, data: Partial<TaskCategory>) {
  return put(`/task/categories/${id}`, data)
}

export function deleteTaskCategory(id: number) {
  return del(`/task/categories/${id}`)
}
