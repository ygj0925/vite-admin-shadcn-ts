import { get, post, put, del, patch } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface Job {
  id: number
  name: string
  group: string
  cron: string
  status: number
  concurrent: boolean
  misfirePolicy: number
  className: string
  description: string
  createTime: string
  updateTime: string
}

export function getJobGroup() {
  return get<string[]>('/schedule/job/group')
}

export function getJobPage(params: PageQuery) {
  return get<PageRes<Job>>('/schedule/job', params)
}

export function addJob(data: Partial<Job>) {
  return post('/schedule/job', data)
}

export function updateJob(id: number, data: Partial<Job>) {
  return put(`/schedule/job/${id}`, data)
}

export function deleteJob(id: number) {
  return del(`/schedule/job/${id}`)
}

export function updateJobStatus(id: number, status: number) {
  return patch(`/schedule/job/${id}/status`, { status })
}

export function triggerJob(id: number) {
  return post(`/schedule/job/trigger/${id}`)
}
