import axios, { type AxiosResponse, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { getToken, removeToken } from '@/lib/auth'
import type { ApiRes } from '@/types/api'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30_000,
})

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Tenant header
    const tenantId = localStorage.getItem('continew-tenant-id')
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId
    }
    return config
  },
  (error) => Promise.reject(error)
)

http.interceptors.response.use(
  (response: AxiosResponse<ApiRes<unknown>>) => {
    const res = response.data
    if (res.success) {
      return response
    }
    // 401 → redirect to login
    if (res.code === 401 && !response.config.url?.includes('/auth/user/info')) {
      removeToken()
      toast.error('登录已过期，请重新登录')
      window.location.href = '/login'
      return Promise.reject(new Error(res.msg))
    }
    // Error toast
    if (res.msg && res.msg.length >= 15) {
      toast.error('操作失败', { description: res.msg })
    } else {
      toast.error(res.msg || '操作失败')
    }
    return Promise.reject(new Error(res.msg))
  },
  (error) => {
    const statusMap: Record<number, string> = {
      400: '请求错误',
      401: '未授权，请登录',
      403: '拒绝访问',
      404: '请求地址不存在',
      408: '请求超时',
      500: '服务器内部错误',
      501: '服务未实现',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时',
    }
    const msg = statusMap[error.response?.status] || `连接错误${error.response?.status}`
    toast.error(msg)
    return Promise.reject(error)
  }
)

export function get<T>(url: string, params?: Record<string, unknown>): Promise<ApiRes<T>> {
  return http.get(url, { params }).then((res) => res.data)
}

export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiRes<T>> {
  return http.post(url, data, config).then((res) => res.data)
}

export function put<T>(url: string, data?: unknown): Promise<ApiRes<T>> {
  return http.put(url, data).then((res) => res.data)
}

export function patch<T>(url: string, data?: unknown): Promise<ApiRes<T>> {
  return http.patch(url, data).then((res) => res.data)
}

export function del<T>(url: string, data?: unknown): Promise<ApiRes<T>> {
  return http.delete(url, { data }).then((res) => res.data)
}

export function download(url: string, params?: Record<string, unknown>): Promise<Blob> {
  return http.get(url, { params, responseType: 'blob' }).then((res) => res.data)
}

export default http
