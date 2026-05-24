import { forwardRef, useImperativeHandle, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import VerifySlide from './verify-slide'
import VerifyPoints from './verify-points'

interface VerifyProps {
  captchaType: 'blockPuzzle' | 'clickWord'
  mode?: 'pop' | 'fixed'
  onSuccess: (data: { captchaVerification: string }) => void
}

export interface VerifyRef {
  show: () => void
  close: () => void
  refresh: () => void
}

const Verify = forwardRef<VerifyRef, VerifyProps>(
  ({ captchaType, mode = 'pop', onSuccess }, ref) => {
    const [open, setOpen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const show = useCallback(() => setOpen(true), [])
    const close = useCallback(() => setOpen(false), [])
    const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

    useImperativeHandle(ref, () => ({
      show,
      close,
      refresh,
    }))

    const handleSuccess = useCallback(
      (data: { captchaVerification: string }) => {
        onSuccess(data)
        close()
      },
      [onSuccess, close]
    )

    const title = captchaType === 'blockPuzzle' ? '滑动验证' : '文字点选验证'

    const captchaContent = captchaType === 'blockPuzzle' ? (
      <VerifySlide key={refreshKey} captchaType={captchaType} onSuccess={handleSuccess} />
    ) : (
      <VerifyPoints key={refreshKey} captchaType={captchaType} onSuccess={handleSuccess} />
    )

    if (mode === 'fixed') {
      return (
        <div className="w-full max-w-[360px]">
          {captchaContent}
        </div>
      )
    }

    // Pop mode (default)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[380px] p-4" showCloseButton>
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base">{title}</DialogTitle>
          </DialogHeader>
          {captchaContent}
        </DialogContent>
      </Dialog>
    )
  }
)

Verify.displayName = 'Verify'

export default Verify
