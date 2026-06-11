import axios, { type AxiosResponse, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { getToken } from '@/lib/auth'
import { showLoginExpiredDialog } from '@/stores/auth-dialog'
import type { ApiRes } from '@/types/api'

/** HTTP 状态码 → 用户可读消息（参考 sss-task-web 的完整版） */
const StatusCodeMessage: Record<number, string> = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功',
  400: '请求错误(400)',
  401: '未授权，请重新登录(401)',
  403: '拒绝访问(403)',
  404: '请求出错(404)',
  408: '请求超时(408)',
  500: '服务器错误(500)',
  501: '服务未实现(501)',
  502: '网络错误(502)',
  503: '服务不可用(503)',
  504: '网络超时(504)',
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_PREFIX ?? import.meta.env.VITE_API_BASE_URL,
  timeout: 30_000,
})

/** msg ≥15 字符 → toast description；短 msg → toast title */
function handleBizError(msg: string) {
  const m = msg || '服务器端错误'
  if (m.length >= 15) {
    toast.error('操作失败', { description: m })
  } else {
    toast.error(m)
  }
}

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
    // Token 失效：弹模态对话框（用户点「重新登录」才会跳转）
    // /auth/user/info 排除：避免初始化阶段获取用户信息失败时叠加弹窗
    //   （该路径的 401 会在 AppRouter 的 Promise.all catch 里走 redirectToLogin）
    if (Number(res.code) === 401 && !response.config.url?.includes('/auth/user/info')) {
      showLoginExpiredDialog(res.msg)
      return Promise.reject(new Error(res.msg))
    }
    // 其他业务错误
    handleBizError(res.msg)
    return Promise.reject(new Error(res.msg))
  },
  (error) => {
    // 网络层错误
    if (!error.response) {
      toast.error('网络连接失败，请检查您的网络')
      return Promise.reject(error)
    }
    const status: number | undefined = error.response?.status
    if (status === 401) {
      // HTTP 401（非业务 code 401）：同样走模态
      showLoginExpiredDialog(StatusCodeMessage[401])
      return Promise.reject(error)
    }
    const msg =
      (status && StatusCodeMessage[status]) ||
      `服务器暂时未响应，请刷新页面并重试。若无法解决，请联系管理员`
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
  return http.get(url, { params, responseType: 'blob' }).then((res) => {
    const data = res.data
    // 检查 blob 是否实际上是 JSON 错误响应
    if (data instanceof Blob && data.type === 'application/json') {
      return data.text().then((text) => {
        const json = JSON.parse(text)
        if (!json.success) {
          toast.error(json.msg || '下载失败')
          return Promise.reject(new Error(json.msg))
        }
        return data
      })
    }
    return data
  })
}

export default http
