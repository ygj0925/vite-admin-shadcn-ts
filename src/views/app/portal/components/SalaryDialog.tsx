import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DollarSign, Lock, Eye, EyeOff } from 'lucide-react'

interface SalaryDialogProps {
  open: boolean
  onClose: () => void
}

const MONTHS = [
  { month: '2024-05', label: '2024年5月', status: '已发放' },
  { month: '2024-04', label: '2024年4月', status: '已发放' },
  { month: '2024-03', label: '2024年3月', status: '已发放' },
]

const SALARY_DETAIL = {
  gross: '18,500',
  net: '15,320',
  items: [
    { label: '基本工资', value: '15,000', type: 'income' as const },
    { label: '绩效奖金', value: '3,500', type: 'income' as const },
    { label: '个人所得税', value: '-1,280', type: 'deduct' as const },
    { label: '社保个人部分', value: '-1,500', type: 'deduct' as const },
    { label: '公积金个人部分', value: '-400', type: 'deduct' as const },
  ],
}

export default function SalaryDialog({ open, onClose }: SalaryDialogProps) {
  const [step, setStep] = useState<'verify' | 'list' | 'detail'>('verify')
  const [pin, setPin] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('2024-05')
  const [showAmount, setShowAmount] = useState(false)
  const [verifyError, setVerifyError] = useState(false)

  const handleVerify = () => {
    if (pin === '1234' || pin.length === 6) {
      setStep('list')
      setVerifyError(false)
    } else {
      setVerifyError(true)
    }
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose()
      setTimeout(() => {
        setStep('verify')
        setPin('')
        setVerifyError(false)
      }, 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="hero-gradient px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-white text-lg font-semibold">薪资查询</DialogTitle>
                <p className="text-blue-200 text-sm mt-0.5">
                  {step === 'verify' ? '请验证身份后查看' : step === 'list' ? '选择查询月份' : '工资条详情'}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {step === 'verify' && (
          <div className="px-6 py-6 space-y-5">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <Lock className="w-7 h-7 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-800">身份验证</p>
                <p className="text-sm text-gray-500 mt-1">请输入工资查询密码(演示:任意6位)</p>
              </div>
            </div>
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  setVerifyError(false)
                }}
                placeholder="请输入查询密码"
                maxLength={6}
                className={`w-full rounded-xl border px-4 py-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2 transition-all ${
                  verifyError
                    ? 'border-red-400 focus:ring-red-300/30'
                    : 'border-gray-200 focus:ring-blue-500/30 focus:border-blue-500'
                }`}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
              {verifyError && (
                <p className="text-red-500 text-xs mt-1.5 text-center">
                  密码错误,请重新输入(演示输入任意6位即可)
                </p>
              )}
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11"
              onClick={handleVerify}
            >
              验证并查看
            </Button>
          </div>
        )}

        {step === 'list' && (
          <div className="px-6 py-5 space-y-3">
            <p className="text-sm text-gray-500 font-medium">选择月份</p>
            {MONTHS.map((m) => (
              <button
                key={m.month}
                onClick={() => {
                  setSelectedMonth(m.month)
                  setStep('detail')
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-800">{m.label}</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">{m.status}</span>
              </button>
            ))}
          </div>
        )}

        {step === 'detail' && (
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep('list')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                ← 返回
              </button>
              <span className="text-sm text-gray-500">
                {MONTHS.find((m) => m.month === selectedMonth)?.label}
              </span>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-5 text-white">
              <p className="text-blue-200 text-sm mb-1">实发工资</p>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold font-mono">
                  {showAmount ? `¥${SALARY_DETAIL.net}` : '¥ ••••••'}
                </p>
                <button
                  onClick={() => setShowAmount(!showAmount)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {showAmount ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t border-white/20">
                <div>
                  <p className="text-blue-200 text-xs">应发合计</p>
                  <p className="text-white font-semibold font-mono">
                    ¥{showAmount ? SALARY_DETAIL.gross : '••••'}
                  </p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs">扣除合计</p>
                  <p className="text-white font-semibold font-mono">¥{showAmount ? '3,180' : '••••'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {SALARY_DETAIL.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span
                    className={`text-sm font-medium font-mono ${
                      item.type === 'deduct' ? 'text-red-500' : 'text-gray-800'
                    }`}
                  >
                    {showAmount ? item.value : item.type === 'deduct' ? '-••••' : '••••'}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center">如有疑问请联系 HR 或通过无忌发起薪资咨询</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
