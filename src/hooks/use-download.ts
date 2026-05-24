import { toast } from 'sonner'

interface DownloadOptions {
  api: () => Promise<Blob>
  fileName?: string
  fileType?: string
  isNotify?: boolean
}

export async function downloadFile({
  api,
  fileName,
  fileType,
  isNotify = true,
}: DownloadOptions) {
  try {
    const blob = await api()

    if (!(blob instanceof Blob)) {
      toast.error('下载失败，返回数据不是文件流')
      return
    }

    // Try to extract filename from content-disposition header
    // Note: This only works if the blob has response metadata attached
    const downloadFileName =
      fileName ||
      (blob as any).response?.headers?.['content-disposition']
        ?.split('filename=')?.[1]
        ?.replace(/"/g, '') ||
      `download${fileType ? `.${fileType}` : ''}`

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = decodeURIComponent(downloadFileName)
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    if (isNotify) {
      toast.success('下载成功')
    }
  } catch {
    // Error handled by HTTP interceptor
  }
}
