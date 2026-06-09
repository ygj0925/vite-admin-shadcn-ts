import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CalendarDays, Clock, User, FileText, CheckCircle2 } from 'lucide-react'

interface LeaveDialogProps {
  open: boolean
  onClose: () => void
}

const LEAVE_TYPES = [
  { id: 'annual', label: '年假', balance: '12天' },
  { id: 'sick', label: '病假', balance: '不限' },
  { id: 'comp', label: '调休', balance: '3天' },
  { id: 'personal', label: '事假', balance: '5天' },
]

export default function LeaveDialog({ open, onClose }: LeaveDialogProps) {
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form')
  const [leaveType, setLeaveType] = useState('annual')
  const [startDate, setStartDate] = useState('2024-06-03')
  const [endDate, setEndDate] = useState('2024-06-03')
  const [reason, setReason] = useState('')

  const selectedType = LEAVE_TYPES.find((t) => t.id === leaveType)

  const handleSubmit = () => {
    if (step === 'form') {
      setStep('confirm')
    } else if (step === 'confirm') {
      setStep('success')
      setTimeout(() => {
        toast.success('请假申请已提交,等待李经理审批')
        onClose()
        setStep('form')
      }, 1800)
    }
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose()
      setTimeout(() => setStep('form'), 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="hero-gradient px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-white text-lg font-semibold">请假申请</DialogTitle>
                <p className="text-blue-200 text-sm mt-0.5">发起后将自动推送给审批人</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {step === 'success' ? (
          <div className="px-6 py-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-green-500" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">申请已提交</p>
              <p className="text-sm text-gray-500 mt-1">已发送给李经理审批,预计1个工作日内处理</p>
            </div>
          </div>
        ) : step === 'confirm' ? (
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm font-medium text-gray-500">请确认以下请假信息</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">假期类型</span>
                <span className="font-medium text-gray-800">{selectedType?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">开始日期</span>
                <span className="font-medium text-gray-800">{startDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">结束日期</span>
                <span className="font-medium text-gray-800">{endDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">审批人</span>
                <span className="font-medium text-gray-800">李经理</span>
              </div>
              {reason && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">请假原因</span>
                  <span className="font-medium text-gray-800 max-w-[180px] text-right">{reason}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>
                返回修改
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit}>
                确认提交
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">假期类型</label>
              <div className="grid grid-cols-4 gap-2">
                {LEAVE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setLeaveType(type.id)}
                    className={`rounded-xl border-2 p-2.5 text-center transition-all duration-150 ${
                      leaveType === type.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-800">{type.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{type.balance}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 开始日期
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 结束日期
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> 审批人
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 bg-gray-50">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                  李
                </div>
                <span className="text-sm text-gray-700">李经理(直属上级)</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> 请假原因(选填)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请简要说明请假原因..."
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-medium"
              onClick={handleSubmit}
            >
              下一步:确认信息
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
