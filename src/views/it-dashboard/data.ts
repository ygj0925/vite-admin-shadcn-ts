import {
  TrendingUp,
  Users,
  CheckCircle,
  DollarSign,
  Clock,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'

// 核心指标
export interface OverviewMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: LucideIcon
  color: string
}

// 项目信息
export interface Project {
  id: string
  name: string
  status: '进行中' | '已完成' | '延期' | '规划中'
  progress: number
  manager: string
  deadline: string
  type: string
}

// 反馈信息
export interface Feedback {
  content: string
  department: string
  rating: number
  date: string
}

// 满意度数据
export interface SatisfactionData {
  overall: number
  nps: number
  responseRate: number
  trend: { month: string; score: number }[]
  departmentScores: { name: string; score: number }[]
  recentFeedback: Feedback[]
}

// 资源数据
export interface ResourceData {
  teamSize: number
  utilization: number
  overtimeRate: number
  skillCoverage: number
  memberUtilization: { name: string; rate: number }[]
  skillDistribution: { name: string; value: number }[]
  monthlyHours: { month: string; hours: number }[]
}

// 价值案例
export interface ValueCase {
  title: string
  description: string
  benefit: string
  icon: string
}

// IT价值数据
export interface ValueData {
  roi: number
  costSaving: number
  efficiencyGain: number
  availability: number
  roiTrend: { month: string; value: number }[]
  costSavingTrend: { month: string; value: number }[]
  cases: ValueCase[]
}

// 项目状态分布
export interface ProjectStatusData {
  name: string
  value: number
}

// 交付趋势
export interface DeliveryTrend {
  month: string
  rate: number
}

// 资源分配
export interface ResourceAllocation {
  name: string
  days: number
}

// 成本节省趋势
export interface CostSavingTrend {
  month: string
  saved: number
}

// =================================================================
// 模拟数据
// =================================================================

// 核心指标
export const overviewMetrics: OverviewMetric[] = [
  {
    title: '项目交付率',
    value: '92.5%',
    change: '+5.2%',
    trend: 'up',
    icon: CheckCircle,
    color: '#10b981',
  },
  {
    title: '满意度评分',
    value: '4.6/5.0',
    change: '+0.3',
    trend: 'up',
    icon: TrendingUp,
    color: '#3b82f6',
  },
  {
    title: '资源利用率',
    value: '78%',
    change: '-2%',
    trend: 'down',
    icon: Users,
    color: '#f59e0b',
  },
  {
    title: 'ROI倍数',
    value: '3.2x',
    change: '+0.5',
    trend: 'up',
    icon: DollarSign,
    color: '#8b5cf6',
  },
]

// 项目列表
export const projects: Project[] = [
  {
    id: '1',
    name: 'ERP系统升级',
    status: '进行中',
    progress: 75,
    manager: '张三',
    deadline: '2026-06-30',
    type: '基础设施',
  },
  {
    id: '2',
    name: 'OA系统重构',
    status: '进行中',
    progress: 45,
    manager: '李四',
    deadline: '2026-07-15',
    type: '办公协同',
  },
  {
    id: '3',
    name: '数据平台建设',
    status: '已完成',
    progress: 100,
    manager: '王五',
    deadline: '2026-05-20',
    type: '数据分析',
  },
  {
    id: '4',
    name: '移动办公APP',
    status: '进行中',
    progress: 60,
    manager: '赵六',
    deadline: '2026-08-01',
    type: '移动应用',
  },
  {
    id: '5',
    name: '安全合规整改',
    status: '延期',
    progress: 30,
    manager: '钱七',
    deadline: '2026-05-15',
    type: '安全合规',
  },
  {
    id: '6',
    name: '客服系统优化',
    status: '规划中',
    progress: 0,
    manager: '孙八',
    deadline: '2026-09-30',
    type: '客户服务',
  },
]

// 项目状态分布
export const projectStatusData: ProjectStatusData[] = [
  { name: '进行中', value: 8 },
  { name: '已完成', value: 14 },
  { name: '延期', value: 2 },
  { name: '规划中', value: 3 },
]

// 交付趋势（近6个月）
export const deliveryTrend: DeliveryTrend[] = [
  { month: '2025-12', rate: 85 },
  { month: '2026-01', rate: 88 },
  { month: '2026-02', rate: 82 },
  { month: '2026-03', rate: 90 },
  { month: '2026-04', rate: 87 },
  { month: '2026-05', rate: 92.5 },
]

// 资源分配（各项目人天）
export const resourceAllocation: ResourceAllocation[] = [
  { name: 'ERP升级', days: 450 },
  { name: 'OA重构', days: 320 },
  { name: '数据平台', days: 280 },
  { name: '移动APP', days: 200 },
  { name: '安全整改', days: 150 },
]

// 成本节省趋势（近6个月，万元）
export const costSavingTrend: CostSavingTrend[] = [
  { month: '2025-12', saved: 18 },
  { month: '2026-01', saved: 22 },
  { month: '2026-02', saved: 19 },
  { month: '2026-03', saved: 25 },
  { month: '2026-04', saved: 28 },
  { month: '2026-05', saved: 32 },
]

// 满意度数据
export const satisfactionData: SatisfactionData = {
  overall: 4.6,
  nps: 68,
  responseRate: 92,
  trend: [
    { month: '2025-12', score: 4.2 },
    { month: '2026-01', score: 4.3 },
    { month: '2026-02', score: 4.1 },
    { month: '2026-03', score: 4.4 },
    { month: '2026-04', score: 4.5 },
    { month: '2026-05', score: 4.6 },
  ],
  departmentScores: [
    { name: '销售部', score: 4.8 },
    { name: '财务部', score: 4.6 },
    { name: '人事部', score: 4.5 },
    { name: '生产部', score: 4.4 },
    { name: '研发部', score: 4.3 },
  ],
  recentFeedback: [
    {
      content: 'ERP系统响应速度很快，大大提升了工作效率',
      department: '销售部',
      rating: 5,
      date: '2026-05-25',
    },
    {
      content: 'OA审批流程还需要进一步优化',
      department: '人事部',
      rating: 4,
      date: '2026-05-23',
    },
    {
      content: '数据平台的报表功能非常实用',
      department: '财务部',
      rating: 5,
      date: '2026-05-20',
    },
  ],
}

// 资源数据
export const resourceData: ResourceData = {
  teamSize: 32,
  utilization: 78,
  overtimeRate: 12,
  skillCoverage: 85,
  memberUtilization: [
    { name: '张三', rate: 92 },
    { name: '李四', rate: 88 },
    { name: '王五', rate: 85 },
    { name: '赵六', rate: 78 },
    { name: '钱七', rate: 75 },
    { name: '孙八', rate: 70 },
  ],
  skillDistribution: [
    { name: 'Java', value: 35 },
    { name: 'React', value: 25 },
    { name: 'Python', value: 20 },
    { name: 'DevOps', value: 15 },
    { name: '其他', value: 5 },
  ],
  monthlyHours: [
    { month: '2025-12', hours: 4800 },
    { month: '2026-01', hours: 5200 },
    { month: '2026-02', hours: 4600 },
    { month: '2026-03', hours: 5100 },
    { month: '2026-04', hours: 5400 },
    { month: '2026-05', hours: 5000 },
  ],
}

// IT价值数据
export const valueData: ValueData = {
  roi: 3.2,
  costSaving: 128,
  efficiencyGain: 35,
  availability: 99.9,
  roiTrend: [
    { month: '2025-12', value: 2.5 },
    { month: '2026-01', value: 2.7 },
    { month: '2026-02', value: 2.8 },
    { month: '2026-03', value: 3.0 },
    { month: '2026-04', value: 3.1 },
    { month: '2026-05', value: 3.2 },
  ],
  costSavingTrend: [
    { month: '2025-12', saved: 18 },
    { month: '2026-01', saved: 22 },
    { month: '2026-02', saved: 19 },
    { month: '2026-03', saved: 25 },
    { month: '2026-04', saved: 28 },
    { month: '2026-05', saved: 32 },
  ],
  cases: [
    {
      title: 'ERP自动化流程',
      description: '实现采购、库存、财务自动化处理',
      benefit: '节省人工40h/月，年化节省¥48万',
      icon: 'Package',
    },
    {
      title: '数据决策平台',
      description: '实时数据分析与可视化报表',
      benefit: '决策效率提升50%，减少误判损失¥30万',
      icon: 'BarChart3',
    },
    {
      title: '移动办公系统',
      description: '随时随地审批、协作、沟通',
      benefit: '响应速度提升60%，员工满意度+15%',
      icon: 'Smartphone',
    },
  ],
}

// 项目类型分布（用于方案B Tab1）
export const projectTypeData = [
  { name: '基础设施', value: 8 },
  { name: '办公协同', value: 6 },
  { name: '数据分析', value: 5 },
  { name: '移动应用', value: 4 },
  { name: '安全合规', value: 3 },
  { name: '客户服务', value: 1 },
]
