import { get, post, put, del, patch } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface Job {
  id: number
  groupName: string
  jobName: string
  description?: string
  triggerType: number
  triggerInterval: string
  taskType: number
  executorInfo: string
  argsStr?: string
  routeKey: number
  blockStrategy: number
  executorTimeout: number
  maxRetryTimes: number
  retryInterval: number
  parallelNum: number
  jobStatus: number
  nextTriggerAt?: string
  createDt?: string
  updateDt?: string
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

export function updateJobStatus(id: number, jobStatus: number) {
  return patch(`/schedule/job/${id}/status`, { jobStatus })
}

export function triggerJob(id: number) {
  return post(`/schedule/job/trigger/${id}`)
}
