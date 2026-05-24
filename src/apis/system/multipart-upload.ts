import { get, post } from '@/apis/http'

export interface MultiPartUploadInitReq {
  fileName: string
  fileSize: number
  fileMd5: string
  parentPath: string
  metaData?: Record<string, string>
}

export interface MultiPartUploadInitResp {
  uploadId: string
  partSize: number
  path: string
  uploadedPartNumbers: number[]
}

export interface UploadPartResp {
  partNumber: number
  partETag: string
  partSize: number
  success: boolean
  errorMessage?: string
}

export function initMultipartUpload(data: MultiPartUploadInitReq) {
  return post<MultiPartUploadInitResp>('/system/multipart-upload/init', data)
}

export function uploadPart(data: FormData, signal?: AbortSignal) {
  return post<UploadPartResp>('/system/multipart-upload/part', data, { signal })
}

export function completeMultipartUpload(uploadId: string) {
  return get<string>(`/system/multipart-upload/complete/${uploadId}`)
}

export function cancelUpload(uploadId: string) {
  return get<void>(`/system/multipart-upload/cancel/${uploadId}`)
}
