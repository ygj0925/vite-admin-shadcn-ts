import { cn } from '@/lib/utils'
import {
  Bot,
  Code,
  PenTool,
  Briefcase,
  GraduationCap,
  Heart,
  Scale,
  Stethoscope,
} from 'lucide-react'

export interface AiRole {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  prompts: string[]
}

// eslint-disable-next-line react-refresh/only-export-components
export const AI_ROLES: AiRole[] = [
  {
    id: 'general',
    name: '通用助手',
    description: '日常问答，知识百科',
    icon: <Bot className="h-5 w-5 text-white" />,
    color: 'from-violet-600 to-blue-600',
    prompts: [
      '帮我总结一下今天的工作',
      '用简单的话解释量子计算',
      '推荐一些提升效率的方法',
      '写一封商务邮件',
    ],
  },
  {
    id: 'coder',
    name: '编程专家',
    description: '代码编写，技术答疑',
    icon: <Code className="h-5 w-5 text-white" />,
    color: 'from-emerald-500 to-teal-500',
    prompts: [
      '帮我写一个 React 自定义 Hook',
      '解释 TypeScript 中的泛型',
      '优化这段 SQL 查询性能',
      '设计一个 RESTful API 结构',
    ],
  },
  {
    id: 'writer',
    name: '写作助手',
    description: '文案撰写，内容创作',
    icon: <PenTool className="h-5 w-5 text-white" />,
    color: 'from-amber-500 to-orange-500',
    prompts: [
      '帮我写一篇产品介绍文案',
      '润色这篇文章的开头段落',
      '用更生动的语言重写这段话',
      '创作一个吸引人的标题',
    ],
  },
  {
    id: 'business',
    name: '商业顾问',
    description: '商业分析，战略建议',
    icon: <Briefcase className="h-5 w-5 text-white" />,
    color: 'from-blue-500 to-indigo-500',
    prompts: [
      '分析这个商业模式的可行性',
      '制定一个季度营销计划',
      'SWOT 分析一个新产品',
      '如何提升用户留存率',
    ],
  },
  {
    id: 'teacher',
    name: '学习导师',
    description: '知识讲解，学习规划',
    icon: <GraduationCap className="h-5 w-5 text-white" />,
    color: 'from-rose-500 to-pink-500',
    prompts: [
      '制定一个 TypeScript 学习路线',
      '用类比解释机器学习原理',
      '设计一个前端面试题库',
      '推荐高效的阅读方法',
    ],
  },
  {
    id: 'life',
    name: '生活助手',
    description: '健康建议，生活规划',
    icon: <Heart className="h-5 w-5 text-white" />,
    color: 'from-pink-500 to-rose-500',
    prompts: [
      '设计一周健康饮食计划',
      '推荐适合程序员的运动',
      '制定每日作息时间表',
      '如何缓解工作压力',
    ],
  },
  {
    id: 'legal',
    name: '法律顾问',
    description: '法律咨询，合同审查',
    icon: <Scale className="h-5 w-5 text-white" />,
    color: 'from-slate-500 to-gray-600',
    prompts: [
      '劳动合同中需要注意哪些条款',
      '知识产权保护的基本流程',
      '如何规范使用开源协议',
      '公司注册需要注意的法律事项',
    ],
  },
  {
    id: 'health',
    name: '健康顾问',
    description: '健康知识，症状参考',
    icon: <Stethoscope className="h-5 w-5 text-white" />,
    color: 'from-cyan-500 to-blue-500',
    prompts: [
      '久坐办公如何保护腰椎',
      '程序员常见的职业病预防',
      '改善睡眠质量的建议',
      '办公室人体工学建议',
    ],
  },
]

interface RoleSelectorProps {
  selectedRoleId: string
  onSelect: (role: AiRole) => void
}

export function RoleSelector({ selectedRoleId, onSelect }: RoleSelectorProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
      {AI_ROLES.map((role) => (
        <button
          key={role.id}
          onClick={() => onSelect(role)}
          className={cn(
            'flex shrink-0 flex-col items-center gap-2 rounded-2xl p-4 min-w-[100px] transition-all',
            'glass glass-dark dark:glass-dark light:glass-light',
            selectedRoleId === role.id
              ? 'ring-2 ring-primary shadow-lg scale-105'
              : 'hover:scale-105 opacity-70 hover:opacity-100'
          )}
        >
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br transition-transform',
              role.color,
              selectedRoleId === role.id && 'animate-float'
            )}
          >
            {role.icon}
          </div>
          <span className="text-xs font-medium whitespace-nowrap">{role.name}</span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{role.description}</span>
        </button>
      ))}
    </div>
  )
}
