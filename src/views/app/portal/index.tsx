import { useState } from 'react'
import { toast } from 'sonner'
import {
  Bell,
  ChevronRight,
  Mic,
  Send,
  CalendarDays,
  DollarSign,
  FileCheck,
  FileText,
  Receipt,
  Headphones,
  Award,
  CalendarClock,
  Monitor,
  Users,
  Wallet,
  Scale,
  Library,
  FolderKanban,
  Clock,
  CheckCircle2,
  MessageSquare,
  Megaphone,
  Sparkles,
  User as UserIcon,
  TrendingUp,
} from 'lucide-react'
import { useUserStore } from '@/stores/user'
import LeaveDialog from './components/LeaveDialog'
import SalaryDialog from './components/SalaryDialog'
import ApprovalDialog from './components/ApprovalDialog'
import ChatDialog from './components/ChatDialog'
import './portal.css'

const QUICK_PROMPTS = [
  '帮我请明天下午半天假',
  '查询上月工资条',
  '我有哪些待审批事项?',
  '帮我审核合同风险',
  '打开财务报销系统',
]

const SERVICE_CARDS = [
  {
    icon: CalendarDays,
    label: '请假申请',
    sub: '年假 / 病假 / 调休',
    color: 'bg-blue-100 text-blue-600',
    status: '可办理',
    statusColor: 'text-green-600 bg-green-50',
    action: 'leave',
  },
  {
    icon: DollarSign,
    label: '查询薪资',
    sub: '工资条 / 个税 / 社保',
    color: 'bg-emerald-100 text-emerald-600',
    status: '可查询',
    statusColor: 'text-green-600 bg-green-50',
    action: 'salary',
  },
  {
    icon: FileCheck,
    label: '审批流程',
    sub: '待办审批 / 流程跟进',
    color: 'bg-orange-100 text-orange-600',
    status: '3条待办',
    statusColor: 'text-orange-600 bg-orange-50',
    action: 'approval',
  },
  {
    icon: FileText,
    label: '合同审核',
    sub: '风险识别 / 法务建议',
    color: 'bg-violet-100 text-violet-600',
    status: '可办理',
    statusColor: 'text-green-600 bg-green-50',
    action: 'contract',
  },
  {
    icon: Receipt,
    label: '报销申请',
    sub: '差旅 / 费用 / 发票',
    color: 'bg-cyan-100 text-cyan-600',
    status: '可申请',
    statusColor: 'text-green-600 bg-green-50',
    action: 'expense',
  },
  {
    icon: Headphones,
    label: 'IT 支持',
    sub: '工单 / 权限 / 设备',
    color: 'bg-indigo-100 text-indigo-600',
    status: '可提交',
    statusColor: 'text-green-600 bg-green-50',
    action: 'it',
  },
  {
    icon: Award,
    label: '证明开具',
    sub: '在职 / 收入证明',
    color: 'bg-pink-100 text-pink-600',
    status: '可开具',
    statusColor: 'text-green-600 bg-green-50',
    action: 'cert',
  },
  {
    icon: CalendarClock,
    label: '会议室预订',
    sub: '空闲查询 / 快速预订',
    color: 'bg-teal-100 text-teal-600',
    status: '可预订',
    statusColor: 'text-green-600 bg-green-50',
    action: 'meeting',
  },
]

const SYSTEMS = [
  { icon: Monitor, label: 'OA 办公', color: 'bg-blue-500' },
  { icon: Users, label: 'HR 系统', color: 'bg-emerald-500' },
  { icon: Wallet, label: '财务报销', color: 'bg-orange-500' },
  { icon: Scale, label: '合同系统', color: 'bg-violet-500' },
  { icon: Library, label: '知识库', color: 'bg-cyan-500' },
  { icon: FolderKanban, label: '项目管理', color: 'bg-pink-500' },
]

const TODOS = [
  {
    id: 1,
    type: '请假审批',
    title: '王丽 年假 2 天',
    sub: '申请时间:2024-05-16 09:30',
    urgency: 'today',
    urgencyLabel: '今天截止',
    icon: CalendarDays,
    iconBg: 'bg-orange-100 text-orange-500',
  },
  {
    id: 2,
    type: '合同待审',
    title: '华东采购框架协议',
    sub: '发起人:李四 · 2024-05-15',
    urgency: 'risk',
    urgencyLabel: '高风险',
    icon: FileText,
    iconBg: 'bg-red-100 text-red-500',
  },
  {
    id: 3,
    type: '报销复核',
    title: '差旅费用 3,280 元',
    sub: '提交人:赵六 · 2024-05-15',
    urgency: 'pending',
    urgencyLabel: '待确认',
    icon: Receipt,
    iconBg: 'bg-yellow-100 text-yellow-600',
  },
]

const REMINDERS = [
  {
    icon: Clock,
    label: '14:00 项目周会',
    sub: '腾讯会议 | 会议室 B-301',
    time: '今天 14:00',
    iconBg: 'bg-blue-100 text-blue-500',
  },
  {
    icon: DollarSign,
    label: '工资条已更新',
    sub: '请前往「查询薪资」查看',
    time: '今天 09:00',
    iconBg: 'bg-green-100 text-green-500',
  },
  {
    icon: FileText,
    label: '制度学习待确认',
    sub: '《信息安全管理制度》学习确认',
    time: '今天 08:30',
    iconBg: 'bg-purple-100 text-purple-500',
  },
]

const FAQS = ['年假还剩几天?', '病假需要哪些材料?', '差旅报销标准是什么?', '如何申请系统权限?']

const URGENCY_STYLE: Record<string, string> = {
  today: 'bg-orange-100 text-orange-600',
  risk: 'bg-red-100 text-red-600',
  pending: 'bg-gray-100 text-gray-500',
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return '上午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

export default function WujiPortal() {
  const userInfo = useUserStore((s) => s.userInfo)
  const nickname = userInfo?.nickname || userInfo?.username || '用户'

  const [chatInput, setChatInput] = useState('')
  const [showLeave, setShowLeave] = useState(false)
  const [showSalary, setShowSalary] = useState(false)
  const [showApproval, setShowApproval] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatInitMsg, setChatInitMsg] = useState('')
  const [greeting] = useState(() => getGreeting())
  const [processedTodos] = useState<number[]>([])

  const openChat = (msg?: string) => {
    setChatInitMsg(msg || '')
    setShowChat(true)
  }

  const handleServiceClick = (action: string) => {
    if (action === 'leave') setShowLeave(true)
    else if (action === 'salary') setShowSalary(true)
    else if (action === 'approval') setShowApproval(true)
    else if (action === 'contract') openChat('帮我审核合同风险')
    else toast.info('功能即将上线,敬请期待')
  }

  const handleSystemClick = (label: string) => {
    toast.success(`正在打开 ${label}...`)
  }

  const handleSendChat = () => {
    if (!chatInput.trim()) return
    openChat(chatInput.trim())
    setChatInput('')
  }

  const handleTodoAction = () => {
    setShowApproval(true)
  }

  return (
    <div className="bg-[#F0F4FA] min-h-full">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 p-3 sm:p-4 lg:p-5 min-h-full">
        <div className="flex-1 min-w-0 space-y-4 lg:space-y-5">
          <div
            className="hero-gradient rounded-2xl overflow-hidden relative fade-in-up"
            style={{ animationDelay: '0ms' }}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
              <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl"></div>
              <div className="absolute top-4 left-1/4 w-1 h-1 bg-white/60 rounded-full"></div>
              <div className="absolute top-8 left-1/3 w-1.5 h-1.5 bg-blue-300/60 rounded-full"></div>
              <div className="absolute top-12 right-1/3 w-1 h-1 bg-white/40 rounded-full"></div>
            </div>

            <div className="flex items-stretch">
              <div className="flex-1 px-5 py-6 sm:px-8 sm:py-7 relative z-10">
                <div className="mb-1">
                  <p className="text-blue-200 text-xs sm:text-sm font-medium flex items-center">
                    <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                    AI 驱动的企业数字助手
                  </p>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {greeting},{nickname}
                </h1>
                <p className="text-blue-200 text-sm sm:text-base mb-4 sm:mb-5">
                  我是无忌,你的企业数字助手。请假、查薪资、审合同、找系统,都可以问我。
                </p>

                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-4 py-3 mb-4 input-glow transition-all max-w-xl">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="试着问我:帮我请假、查询工资、打开报销系统……"
                    className="flex-1 bg-transparent text-white placeholder-blue-300/80 text-sm outline-none"
                  />
                  <button className="text-blue-200 hover:text-white transition-colors p-1">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSendChat}
                    className="w-8 h-8 rounded-xl bg-white/25 hover:bg-white/35 flex items-center justify-center transition-all active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => openChat(p)}
                      className="text-xs text-blue-100 bg-white/12 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5 transition-all active:scale-95"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-52 flex-shrink-0 relative hidden lg:flex items-end justify-center">
                <div className="avatar-float relative z-10 pb-0 w-44 h-52 flex items-end justify-center pb-4">
                  <div className="w-28 h-40 rounded-2xl bg-gradient-to-br from-blue-400/40 to-violet-500/40 flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <UserIcon className="w-16 h-16 text-white/70" />
                  </div>
                </div>
                <div className="absolute top-4 right-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30">
                  <p className="text-white text-xs font-medium">待办 3 项</p>
                  <p className="text-blue-200 text-[10px]">需要处理</p>
                </div>
              </div>
            </div>
          </div>

          <div className="fade-in-up" style={{ animationDelay: '80ms' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-800">常用办事</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                全部服务 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SERVICE_CARDS.map((card) => {
                const Icon = card.icon
                return (
                  <button
                    key={card.label}
                    onClick={() => handleServiceClick(card.action)}
                    className="service-card bg-white rounded-2xl p-4 text-left border border-gray-100 hover:border-blue-200 group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-0.5">{card.label}</p>
                    <p className="text-xs text-gray-400 mb-2">{card.sub}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${card.statusColor}`}>
                      {card.status}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="fade-in-up" style={{ animationDelay: '160ms' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-800">常用系统</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                全部系统 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {SYSTEMS.map((sys) => {
                  const Icon = sys.icon
                  return (
                    <button
                      key={sys.label}
                      onClick={() => handleSystemClick(sys.label)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-all group active:scale-95"
                    >
                      <div
                        className={`w-11 h-11 rounded-xl ${sys.color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{sys.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="fade-in-up" style={{ animationDelay: '240ms' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-800">大家都在问</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                更多问题 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
              {FAQS.map((faq, i) => (
                <button
                  key={faq}
                  onClick={() => openChat(faq)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-blue-50/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">
                      {faq}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <div
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden fade-in-up"
            style={{ animationDelay: '40ms' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-800">我的待办</h3>
                <span className="w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  3
                </span>
              </div>
              <button
                onClick={() => setShowApproval(true)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                查看全部 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {TODOS.filter((t) => !processedTodos.includes(t.id)).map((todo) => {
                const Icon = todo.icon
                return (
                  <div
                    key={todo.id}
                    className="px-4 py-3.5 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl ${todo.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs text-gray-400">{todo.type}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              URGENCY_STYLE[todo.urgency]
                            }`}
                          >
                            {todo.urgencyLabel}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 truncate">{todo.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{todo.sub}</p>
                      </div>
                      <button
                        onClick={handleTodoAction}
                        className="flex-shrink-0 text-xs text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg transition-all active:scale-95 font-medium"
                      >
                        处理
                      </button>
                    </div>
                  </div>
                )
              })}
              {processedTodos.length === TODOS.length && (
                <div className="px-5 py-6 text-center text-gray-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p className="text-sm">暂无待办事项</p>
                </div>
              )}
            </div>
          </div>

          <div
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden fade-in-up"
            style={{ animationDelay: '120ms' }}
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
              <Bell className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-gray-800">今日提醒</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {REMINDERS.map((r) => {
                const Icon = r.icon
                return (
                  <div
                    key={r.label}
                    className="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg ${r.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{r.sub}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{r.time}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold text-gray-800">公司动态</h3>
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-700 transition-colors">
                更多动态
              </button>
            </div>
            <div className="p-4">
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-white bg-red-500 px-2 py-0.5 rounded-full font-medium">
                      置顶
                    </span>
                    <span className="text-xs text-gray-400">人力资源部</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">新版报销制度 6 月起执行</p>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    为进一步规范费用报销流程,提高报销效率,新版《费用报销管理制度》将于 2024 年 6 月 1
                    日起正式执行。
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">2024-05-15</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> 1,256 次阅读
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => openChat()}
            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25 fade-in-up"
            style={{ animationDelay: '280ms' }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">与无忌对话</p>
              <p className="text-blue-200 text-xs mt-0.5">随时提问,随时办理</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/60 ml-auto" />
          </button>
        </div>
      </div>

      <LeaveDialog open={showLeave} onClose={() => setShowLeave(false)} />
      <SalaryDialog open={showSalary} onClose={() => setShowSalary(false)} />
      <ApprovalDialog open={showApproval} onClose={() => setShowApproval(false)} />
      <ChatDialog
        open={showChat}
        onClose={() => setShowChat(false)}
        initialMessage={chatInitMsg}
      />
    </div>
  )
}
