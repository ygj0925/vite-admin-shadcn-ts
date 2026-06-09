import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ClipboardList, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'

interface ApprovalDialogProps {
  open: boolean
  onClose: () => void
}

const APPROVALS = [
  {
    id: 1,
    type: '请假审批',
    title: '王丽 申请年假 2 天',
    desc: '2024-06-03 至 2024-06-04,原因:家庭事务',
    time: '今天 09:30',
    urgency: 'today',
    urgencyLabel: '今天截止',
    icon: '🏖️',
  },
  {
    id: 2,
    type: '合同审核',
    title: '华东采购框架协议',
    desc: '合同金额:¥280,000,合同期:12个月,已识别 2 处风险条款',
    time: '昨天 16:20',
    urgency: 'risk',
    urgencyLabel: '高风险',
    icon: '📄',
  },
  {
    id: 3,
    type: '报销复核',
    title: '赵六 差旅费用报销',
    desc: '出差北京,费用合计 ¥3,280,含机票、住宿、餐饮',
    time: '2024-05-31',
    urgency: 'pending',
    urgencyLabel: '待确认',
    icon: '💰',
  },
]

const URGENCY_STYLE: Record<string, string> = {
  today: 'bg-orange-100 text-orange-600',
  risk: 'bg-red-100 text-red-600',
  pending: 'bg-gray-100 text-gray-600',
}

export default function ApprovalDialog({ open, onClose }: ApprovalDialogProps) {
  const [processed, setProcessed] = useState<Record<number, 'approved' | 'rejected'>>({})
  const [comment, setComment] = useState('')
  const [activeId, setActiveId] = useState<number | null>(null)

  const handleAction = (id: number, action: 'approved' | 'rejected') => {
    setProcessed((prev) => ({ ...prev, [id]: action }))
    const item = APPROVALS.find((a) => a.id === id)
    if (action === 'approved') {
      toast.success(`已同意:${item?.title}`)
    } else {
      toast.error(`已驳回:${item?.title}`)
    }
    setActiveId(null)
    setComment('')
  }

  const pending = APPROVALS.filter((a) => !processed[a.id])
  const done = APPROVALS.filter((a) => processed[a.id])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="hero-gradient px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-white text-lg font-semibold">审批流程</DialogTitle>
                <p className="text-blue-200 text-sm mt-0.5">
                  待处理 {pending.length} 项 · 已处理 {done.length} 项
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-5 py-4 flex-1 min-h-0 overflow-y-auto space-y-3">
          {pending.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                待处理
              </p>
              {pending.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div
                    className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setActiveId(activeId === item.id ? null : item.id)}
                  >
                    <span className="text-2xl mt-0.5">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">{item.type}</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            URGENCY_STYLE[item.urgency]
                          }`}
                        >
                          {item.urgencyLabel}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.desc}</p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 mt-1 transition-transform ${
                        activeId === item.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  {activeId === item.id && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-3">
                      <p className="text-sm text-gray-600">{item.desc}</p>
                      <p className="text-xs text-gray-400">提交时间:{item.time}</p>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="审批意见(选填)"
                        rows={2}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 text-sm"
                          onClick={() => handleAction(item.id, 'approved')}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> 同意
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-lg h-9 text-sm"
                          onClick={() => handleAction(item.id, 'rejected')}
                        >
                          <XCircle className="w-4 h-4 mr-1.5" /> 驳回
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {done.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mt-4">
                已处理
              </p>
              {done.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <span className="text-xl opacity-50">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 line-through">{item.title}</p>
                  </div>
                  {processed[item.id] === 'approved' ? (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 已同意
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> 已驳回
                    </span>
                  )}
                </div>
              ))}
            </>
          )}

          {pending.length === 0 && done.length === APPROVALS.length && (
            <div className="py-8 text-center text-gray-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-400" />
              <p className="text-sm">所有审批已处理完毕</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
