interface DownloadByUrlOptions {
  url: string
  target?: string
  fileName?: string
}

function isSameOrigin(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.origin === window.location.origin
  } catch {
    // If URL parsing fails, treat as same-origin (relative URL)
    return true
  }
}

export async function downloadByUrl({
  url,
  target = '_blank',
  fileName,
}: DownloadByUrlOptions): Promise<boolean> {
  if (isSameOrigin(url)) {
    const a = document.createElement('a')
    a.href = url
    if (fileName) {
      a.download = fileName
    }
    a.target = target
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return true
  }

  // Cross-origin: fetch blob then trigger download
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = fileName || url.split('/').pop() || 'download'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(objectUrl)
    return true
  } catch {
    // Fallback: open in new tab
    window.open(url, target)
    return false
  }
}
