import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getBehaviorCaptcha,
  checkBehaviorCaptcha,
  type BehaviorCaptchaResp,
} from '@/apis/common/captcha'
import { encryptByAes } from '@/utils/encrypt'

interface VerifySlideProps {
  captchaType?: string
  onSuccess: (data: { captchaVerification: string }) => void
  onError?: () => void
}

const REF_WIDTH = 310

export default function VerifySlide({
  captchaType = 'blockPuzzle',
  onSuccess,
  onError,
}: VerifySlideProps) {
  const [captchaData, setCaptchaData] = useState<BehaviorCaptchaResp | null>(null)
  const [sliderLeft, setSliderLeft] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle')
  const [loading, setLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef(0)
  const containerWidth = useRef(0)

  const fetchCaptcha = useCallback(async () => {
    setLoading(true)
    setStatus('idle')
    setSliderLeft(0)
    try {
      const res = await getBehaviorCaptcha({ captchaType })
      setCaptchaData(res.data)
    } catch {
      // Error handled by HTTP interceptor
    } finally {
      setLoading(false)
    }
  }, [captchaType])

  useEffect(() => {
    fetchCaptcha()
  }, [fetchCaptcha])

  const handleDragStart = useCallback(
    (clientX: number) => {
      if (!captchaData || status !== 'idle') return
      setIsDragging(true)
      dragStartX.current = clientX
      if (containerRef.current) {
        containerWidth.current = containerRef.current.offsetWidth
      }
    },
    [captchaData, status]
  )

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !containerRef.current) return
      const diff = clientX - dragStartX.current
      const maxLeft = containerWidth.current - 40 // slider thumb width
      const newLeft = Math.max(0, Math.min(diff, maxLeft))
      setSliderLeft(newLeft)
    },
    [isDragging]
  )

  const handleDragEnd = useCallback(async () => {
    if (!isDragging || !captchaData) return
    setIsDragging(false)

    // Scale x position to 310px reference width
    const scale = REF_WIDTH / containerWidth.current
    const x = Math.round(sliderLeft * scale)

    let pointJson: string
    if (captchaData.secretKey) {
      const encrypted = encryptByAes(
        JSON.stringify({ x, y: captchaData.point.y }),
        captchaData.secretKey
      )
      pointJson = encrypted
    } else {
      pointJson = JSON.stringify({ x, y: captchaData.point.y })
    }

    try {
      const res = await checkBehaviorCaptcha({
        captchaType,
        pointJson,
        token: captchaData.token,
      })
      if (res.data.repCode === '0000') {
        setStatus('success')
        const captchaVerification = `${captchaData.token}---${pointJson}`
        onSuccess({ captchaVerification })
      } else {
        setStatus('fail')
        onError?.()
        setTimeout(() => fetchCaptcha(), 1000)
      }
    } catch {
      setStatus('fail')
      onError?.()
      setTimeout(() => fetchCaptcha(), 1000)
    }
  }, [isDragging, captchaData, sliderLeft, captchaType, onSuccess, onError, fetchCaptcha])

  // Mouse events
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handleDragMove(e.clientX)
    }
    const onMouseUp = () => handleDragEnd()

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  // Touch events
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      handleDragMove(e.touches[0].clientX)
    }
    const onTouchEnd = () => handleDragEnd()

    if (isDragging) {
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('touchend', onTouchEnd)
    }
    return () => {
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  if (loading || !captchaData) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
        加载中...
      </div>
    )
  }

  const bgUrl = `data:image/png;base64,${captchaData.originalImageBase64}`
  const jigsawUrl = `data:image/png;base64,${captchaData.jigsawImageBase64}`

  return (
    <div className="select-none" ref={containerRef}>
      {/* Image area */}
      <div className="relative w-full overflow-hidden rounded bg-gray-100" style={{ aspectRatio: '310/155' }}>
        {/* Background image */}
        <img
          src={bgUrl}
          alt="captcha background"
          className="block w-full h-full object-cover"
          draggable={false}
        />
        {/* Jigsaw puzzle piece overlay */}
        <img
          src={jigsawUrl}
          alt="jigsaw piece"
          className="absolute top-0 h-[40%] pointer-events-none transition-[left] duration-100"
          style={{ left: `${sliderLeft}px` }}
          draggable={false}
        />
        {/* Status feedback overlay */}
        {status === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
            <span className="text-green-600 font-medium text-sm">验证成功</span>
          </div>
        )}
        {status === 'fail' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
            <span className="text-red-600 font-medium text-sm">验证失败</span>
          </div>
        )}
      </div>

      {/* Slider bar */}
      <div className="relative mt-2 h-[40px] w-full rounded border border-gray-200 bg-gray-50">
        {/* Progress track */}
        <div
          className="absolute top-0 left-0 h-full rounded transition-[width] duration-100"
          style={{
            width: `${sliderLeft + 40}px`,
            backgroundColor:
              status === 'success'
                ? '#22c55e'
                : status === 'fail'
                  ? '#ef4444'
                  : '#3E6AE1',
            opacity: status === 'idle' ? 0.3 : 0.2,
          }}
        />
        {/* Slider thumb */}
        <div
          className="absolute top-0 flex h-full w-[40px] cursor-pointer items-center justify-center rounded border border-gray-300 bg-white shadow-sm transition-[left] duration-100"
          style={{ left: `${sliderLeft}px` }}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
        {/* Hint text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-muted-foreground">
          {status === 'idle' && !isDragging && '向右滑动完成验证'}
        </div>
      </div>

      {/* Refresh button */}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={fetchCaptcha}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          刷新
        </button>
      </div>
    </div>
  )
}
