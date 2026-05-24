import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getBehaviorCaptcha,
  checkBehaviorCaptcha,
  type BehaviorCaptchaResp,
} from '@/apis/common/captcha'
import { encryptByAes } from '@/utils/encrypt'

interface VerifyPointsProps {
  captchaType?: string
  onSuccess: (data: { captchaVerification: string }) => void
  onError?: () => void
}

const REF_WIDTH = 310
const REF_HEIGHT = 155

interface ClickPoint {
  x: number
  y: number
}

export default function VerifyPoints({
  captchaType = 'clickWord',
  onSuccess,
  onError,
}: VerifyPointsProps) {
  const [captchaData, setCaptchaData] = useState<BehaviorCaptchaResp | null>(null)
  const [clickPoints, setClickPoints] = useState<ClickPoint[]>([])
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle')
  const [loading, setLoading] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const fetchCaptcha = useCallback(async () => {
    setLoading(true)
    setStatus('idle')
    setClickPoints([])
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

  const handleImageClick = useCallback(
    async (e: React.MouseEvent<HTMLImageElement>) => {
      if (!captchaData || !imgRef.current || status !== 'idle') return
      if (clickPoints.length >= 3) return

      const rect = imgRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      // Scale to reference dimensions (310x155)
      const scaleX = REF_WIDTH / rect.width
      const scaleY = REF_HEIGHT / rect.height
      const scaledX = Math.round(clickX * scaleX)
      const scaledY = Math.round(clickY * scaleY)

      const newPoints = [...clickPoints, { x: scaledX, y: scaledY }]
      setClickPoints(newPoints)

      // After 3 clicks, submit verification
      if (newPoints.length === 3) {
        let pointJson: string
        const pointsData = newPoints.map((p) => ({ x: p.x, y: p.y }))

        if (captchaData.secretKey) {
          pointJson = encryptByAes(JSON.stringify(pointsData), captchaData.secretKey)
        } else {
          pointJson = JSON.stringify(pointsData)
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
            setTimeout(() => fetchCaptcha(), 700)
          }
        } catch {
          setStatus('fail')
          onError?.()
          setTimeout(() => fetchCaptcha(), 700)
        }
      }
    },
    [captchaData, clickPoints, status, captchaType, onSuccess, onError, fetchCaptcha]
  )

  if (loading || !captchaData) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
        加载中...
      </div>
    )
  }

  const bgUrl = `data:image/png;base64,${captchaData.originalImageBase64}`
  const wordList = captchaData.wordList || []

  return (
    <div className="select-none">
      {/* Word prompt */}
      <div className="mb-2 text-center text-sm text-foreground">
        请依次点击
        <span className="mx-1 font-medium text-[#3E6AE1]">
          [{wordList.join(', ')}]
        </span>
      </div>

      {/* Image area with click overlay */}
      <div
        className="relative w-full overflow-hidden rounded bg-gray-100 cursor-pointer"
        style={{ aspectRatio: `${REF_WIDTH}/${REF_HEIGHT}` }}
      >
        <img
          ref={imgRef}
          src={bgUrl}
          alt="captcha background"
          className="block w-full h-full object-cover"
          draggable={false}
          onClick={handleImageClick}
        />

        {/* Click point indicators */}
        {clickPoints.map((point, index) => {
          if (!imgRef.current) return null
          const rect = imgRef.current.getBoundingClientRect?.()
          // Convert back from scaled coords to display coords
          const displayX = (point.x / REF_WIDTH) * 100
          const displayY = (point.y / REF_HEIGHT) * 100

          return (
            <div
              key={index}
              className="absolute flex items-center justify-center pointer-events-none"
              style={{
                left: `${displayX}%`,
                top: `${displayY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs font-medium shadow-md">
                {index + 1}
              </div>
            </div>
          )
        })}

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
