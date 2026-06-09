import { useState, useRef, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Send, Mic, Bot, User, Sparkles } from 'lucide-react'

interface ChatDialogProps {
  open: boolean
  onClose: () => void
  initialMessage?: string
}

interface Message {
  id: number
  role: 'user' | 'bot'
  content: string
  time: string
}

const QUICK_REPLIES = [
  '年假还剩几天?',
  '病假需要什么材料?',
  '差旅报销标准是什么?',
  '如何申请系统权限?',
  '工资什么时候发?',
]

const BOT_RESPONSES: Record<string, string> = {
  '帮我请明天下午半天假':
    '好的,我来帮你发起请假申请。\n\n📋 请假信息确认\n- 假期类型:年假\n- 开始时间:明天 13:00\n- 结束时间:明天 18:00\n- 时长:0.5天\n- 审批人:李经理\n- 剩余年假:11.5天\n\n请确认以上信息是否正确,确认后我将提交申请。',
  '查询上月工资条':
    '好的,正在为你查询2024年5月工资条...\n\n🔒 为保护薪资隐私,请先完成身份验证。\n\n验证方式:\n1. 输入工资查询密码\n2. 人脸识别(移动端)\n\n请点击右上角「查询薪资」进行验证后查看详情。',
  '我有哪些待审批事项?':
    '📋 你当前有 3 项待处理事项:\n\n1. 🏖️ 请假审批(今天截止)\n   王丽 申请年假 2 天\n\n2. 📄 合同审核(高风险)\n   华东采购框架协议,已识别 2 处风险条款\n\n3. 💰 报销复核(待确认)\n   赵六 差旅费用 ¥3,280\n\n建议优先处理今天截止的请假审批。需要我直接打开审批界面吗?',
  '年假还剩几天?':
    '📅 你的年假余额\n\n- 本年度年假总额:15天\n- 已使用:3天\n- 剩余:12天\n- 到期时间:2024年12月31日\n\n💡 提示:年假可跨年度保留至次年3月31日,超期未使用将自动失效。需要现在发起请假申请吗?',
  '病假需要什么材料?':
    '🏥 病假申请所需材料\n\n3天以内:\n- 在线提交申请即可,无需纸质材料\n\n3-7天:\n- 医院就诊证明(原件或照片)\n- 病假条(医院开具)\n\n7天以上:\n- 医院诊断证明书\n- 住院病历(如住院)\n- 需经HR审核\n\n所有材料可通过无忌上传,或交至HR部门。',
  '差旅报销标准是什么?':
    '✈️ 差旅费用报销标准(2024版)\n\n一线城市:住宿 ≤600元/晚,餐饮 100元/天\n新一线城市:住宿 ≤450元/晚,餐饮 80元/天\n其他城市:住宿 ≤350元/晚,餐饮 60元/天\n\n交通:\n- 飞机:经济舱(4小时以上可申请商务舱)\n- 高铁:二等座(6小时以上可申请一等座)\n\n详细制度请查看「知识库 > 财务制度 > 差旅管理办法」',
  '如何申请系统权限?':
    '🔑 系统权限申请流程\n\n1. 在「常用办事」中点击「IT支持」\n2. 选择「权限申请」\n3. 填写所需系统和权限级别\n4. 提交后由IT部门审核(1-2个工作日)\n\n常见系统权限申请:\n- OA系统:直接开通,无需审批\n- 财务系统:需部门主管审批\n- 合同系统:需法务负责人审批\n- ERP系统:需IT总监审批\n\n需要我现在帮你发起权限申请吗?',
  '工资什么时候发?':
    '💰 工资发放时间\n\n- 正式员工:每月 15日 发放上月工资\n- 如遇节假日:提前至最近工作日发放\n\n2024年近期发放计划:\n- 6月工资:7月15日(周一)✅\n- 7月工资:8月15日(周四)\n\n💡 工资条在发放当天通过无忌推送,也可在「查询薪资」中随时查看。',
  '打开财务报销系统':
    '好的,正在为你打开财务报销系统...\n\n🚀 财务报销系统\n- 系统状态:正常运行中\n- 你的权限:普通员工(可提交报销)\n- 待处理报销:0 条\n\n点击下方按钮直接进入系统,或告诉我你需要报销什么,我可以帮你预填表单。',
  '帮我审核合同风险':
    '好的,请上传合同文件,我将基于以下维度自动审核:\n\n📄 合同风险审核维度\n- 主体资质核查\n- 付款条件与违约金\n- 知识产权归属\n- 保密条款\n- 争议解决方式\n- 不可抗力条款\n\n你也可以直接告诉我合同关键条款,我先帮你初步分析。',
}

const DEFAULT_RESPONSE =
  '感谢你的提问!我正在理解你的需求...\n\n作为无忌数字人助手,我可以帮你:\n- 📋 发起请假、报销等流程\n- 💰 查询薪资、社保信息\n- 📄 审核合同风险\n- 🔍 查询制度和政策\n- 🚀 快速打开常用系统\n\n请尝试更具体的问题,例如「帮我请明天下午半天假」或「年假还剩几天?」'

function getTime() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function findResponse(input: string): string {
  const trimmed = input.trim()
  if (BOT_RESPONSES[trimmed]) return BOT_RESPONSES[trimmed]
  for (const key of Object.keys(BOT_RESPONSES)) {
    if (trimmed.includes(key.slice(0, 4)) || key.includes(trimmed.slice(0, 4))) {
      return BOT_RESPONSES[key]
    }
  }
  return DEFAULT_RESPONSE
}

export default function ChatDialog({ open, onClose, initialMessage }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'bot',
      content:
        '你好,我是无忌!我可以帮你请假、查薪资、处理审批、审核合同,或者帮你打开任何系统。\n\n请问有什么可以帮你?',
      time: getTime(),
    },
  ])
  const [input, setInput] = useState(initialMessage || '')
  const [isTyping, setIsTyping] = useState(false)
  const [seenInitial, setSeenInitial] = useState(initialMessage)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  if (open && initialMessage && initialMessage !== seenInitial) {
    setSeenInitial(initialMessage)
    setInput(initialMessage)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = useCallback(
    (text?: string) => {
      const content = (text || input).trim()
      if (!content) return

      const stamp = Date.now()
      const userMsg: Message = { id: stamp, role: 'user', content, time: getTime() }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsTyping(true)

      setTimeout(
        () => {
          const botMsg: Message = {
            id: stamp + 1,
            role: 'bot',
            content: findResponse(content),
            time: getTime(),
          }
          setMessages((prev) => [...prev, botMsg])
          setIsTyping(false)
        },
        900 + (stamp % 600),
      )
    },
    [input],
  )

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden rounded-2xl border-0 shadow-2xl flex flex-col h-[85vh] sm:h-[600px] sm:max-h-[85vh]"
      >
        <div className="hero-gradient px-5 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white pulse-dot"></span>
          </div>
          <div>
            <DialogTitle className="text-white font-semibold text-base">无忌数字助手</DialogTitle>
            <p className="text-blue-200 text-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 在线 · 随时为你服务
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} fade-in-up`}
            >
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                  msg.role === 'bot' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {msg.role === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[78%] ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                } flex flex-col gap-1`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'bot'
                      ? 'bg-white text-gray-800 shadow-sm border border-gray-100'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400 px-1">{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5 fade-in-up">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></span>
                <span
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></span>
                <span
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto flex-shrink-0">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="flex-shrink-0 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full px-3 py-1.5 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 input-glow transition-all">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="输入问题或指令,例如:帮我请假..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
            />
            <button className="text-gray-400 hover:text-blue-500 transition-colors p-1">
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
