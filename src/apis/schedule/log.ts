import { get, post } from '@/apis/http'
import type { PageRes, PageQuery } from '@/types/api'

export interface JobLog {
  id: number
  jobId: number
  jobName: string
  jobGroup: string
  className: string
  cron: string
  status: number
  errorMsg: string
  startTime: string
  endTime: string
  duration: number
}

export function getJobLogPage(params: PageQuery) {
  return get<PageRes<JobLog>>('/schedule/log', params)
}

export function getJobLogById(id: number) {
  return get<JobLog>(`/schedule/log/${id}`)
}

export function stopJobLog(id: number) {
  return post(`/schedule/log/stop/${id}`)
}

export function retryJobLog(id: number) {
  return post(`/schedule/log/retry/${id}`)
}
