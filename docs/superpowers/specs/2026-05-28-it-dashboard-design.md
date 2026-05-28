# IT项目管理看板设计文档

## 概述

为公司高层/管理层提供IT部门项目管理的可视化看板，展示项目交付情况、满意度、资源使用情况和IT价值/ROI。两个独立页面，无需登录即可访问。

## 目标受众

公司高层/管理层（CEO、CTO等决策者），关注整体IT价值和ROI。

## 页面规划

### 路由设计

两个页面均在AuthGuard外，无需登录即可访问：

| 路由 | 页面 | 说明 |
|------|------|------|
| `/it-dashboard` | 方案A：单页面看板 | 一屏展示所有关键指标 |
| `/it-dashboard-tabs` | 方案B：多Tab分区看板 | 按维度分Tab展示 |

### 文件结构

```
src/views/it-dashboard/
├── index.tsx          # 方案A：单页面看板
└── tabs/
    └── index.tsx      # 方案B：多Tab分区看板
```

---

## 方案A：单页面看板

### 页面布局

从上到下的布局结构：

1. **页面标题栏**
   - 标题：IT项目管理看板
   - 副标题：最后更新时间

2. **核心指标卡片**（4列）
   - 项目交付率：92.5%，较上月↑5.2%
   - 满意度评分：4.6/5.0，较上月↑0.3
   - 资源利用率：78%，较上月↓2%
   - ROI倍数：3.2x，较上月↑0.5

3. **图表区域**（2x2网格）
   - 项目状态分布：饼图 - 进行中/已完成/延期/规划中
   - 交付趋势：折线图 - 近6个月按时交付率变化
   - 资源分配：柱状图 - 各项目人力投入（人天）
   - 成本节省：面积图 - 月度成本优化趋势

4. **近期重点项目**（列表）
   - 展示3-5个近期重点项目
   - 包含：项目名称、状态、进度条、截止日期

### 核心指标定义

| 指标 | 计算方式 | 展示格式 |
|------|----------|----------|
| 项目交付率 | 按时交付项目数 / 总项目数 × 100% | 百分比 + 趋势箭头 |
| 满意度评分 | 业务部门评分平均值 | 分数/5.0 + 趋势 |
| 资源利用率 | 实际工时 / 可用工时 × 100% | 百分比 + 趋势 |
| ROI倍数 | (收益 - 成本) / 成本 | 倍数 + 趋势 |

---

## 方案B：多Tab分区看板

### Tab结构

4个Tab页，每个Tab聚焦一个维度：

#### Tab 1：项目概览

**指标卡片**：
- 总项目数：24
- 进行中：8
- 已完成：14
- 延期：2

**图表**：
- 交付趋势：折线图 - 近6个月按时交付率变化
- 项目类型分布：饼图 - 按项目类型分类

**项目列表表格**：
- 列：项目名称、状态、负责人、进度、截止日期
- 筛选：使用Select组件按状态筛选（全部/进行中/已完成/延期/规划中）

#### Tab 2：满意度

**指标卡片**：
- 综合评分：4.6/5.0
- NPS：68
- 响应满意度：92%

**图表**：
- 满意度趋势：折线图 - 近6个月评分变化
- 各部门评分：柱状图 - 各业务部门评分对比

**近期反馈列表**：
- 展示最近的评价内容
- 包含：评价内容、部门、星级评分

#### Tab 3：资源使用

**指标卡片**：
- 团队规模：32人
- 利用率：78%
- 加班率：12%
- 技能覆盖：85%

**图表**：
- 人员利用率：柱状图 - 各成员利用率
- 技能分布：饼图 - 按技术栈分类
- 工时统计：面积图 - 月度工时趋势
- 项目人力分配：表格 - 各项目人力分配明细

#### Tab 4：IT价值

**指标卡片**：
- ROI：3.2x
- 成本节省：¥128万
- 效率提升：35%
- 系统可用性：99.9%

**图表**：
- ROI趋势：折线图 - 近12个月ROI变化
- 成本节省：面积图 - 月度成本节省趋势

**价值案例列表**：
- 展示2-3个典型价值案例
- 包含：案例描述、量化收益

---

## 技术实现

### 依赖组件

- **UI组件**：复用现有shadcn/ui组件
  - `Card`, `CardContent`, `CardHeader`, `CardTitle`
  - `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
  - `Badge`, `Progress`
  - `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`

- **图表组件**：复用recharts
  - `AreaChart`, `BarChart`, `PieChart`, `LineChart`
  - `ChartContainer`, `TESLA_COLORS`

- **图标**：lucide-react
  - `TrendingUp`, `TrendingDown`, `Users`, `CheckCircle`, `Clock`, `DollarSign`

### 数据结构

```typescript
// 核心指标
interface OverviewMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: LucideIcon
  color: string
}

// 项目信息
interface Project {
  id: string
  name: string
  status: '进行中' | '已完成' | '延期' | '规划中'
  progress: number
  manager: string
  deadline: string
  type: string
}

// 反馈信息
interface Feedback {
  content: string
  department: string
  rating: number
  date: string
}

// 满意度数据
interface SatisfactionData {
  overall: number
  nps: number
  responseRate: number
  trend: number[]
  departmentScores: { name: string; score: number }[]
  recentFeedback: Feedback[]
}

// 资源数据
interface ResourceData {
  teamSize: number
  utilization: number
  overtimeRate: number
  skillCoverage: number
  memberUtilization: { name: string; rate: number }[]
  skillDistribution: { name: string; value: number }[]
}

// 价值案例
interface ValueCase {
  title: string
  description: string
  benefit: string
  icon: string
}

// IT价值数据
interface ValueData {
  roi: number
  costSaving: number
  efficiencyGain: number
  availability: number
  roiTrend: { month: string; value: number }[]
  costSavingTrend: { month: string; value: number }[]
  cases: ValueCase[]
}
```

### 模拟数据

使用硬编码的模拟数据，后续可替换为真实API调用。数据应包含：
- 6-12个月的历史趋势数据
- 3-5个近期项目
- 4-6个部门的评分数据
- 2-3个价值案例

---

## 样式规范

遵循shadcn/ui设计规范：

- **颜色**：使用CSS变量定义的主题色
- **间距**：`space-y-6` 页面垂直间距，`gap-4` 卡片间距
- **圆角**：`rounded-lg` 卡片圆角
- **阴影**：使用Card组件默认阴影
- **字体**：
  - 标题：`text-lg font-medium`
  - 副标题：`text-sm text-muted-foreground`
  - 数值：`text-2xl font-semibold`

---

## 后续扩展

1. **API集成**：替换模拟数据为真实API调用
2. **数据刷新**：添加自动刷新或手动刷新按钮
3. **导出功能**：支持导出PDF或Excel
4. **时间筛选**：添加日期范围选择器
5. **权限控制**：虽然无需登录，但可添加简单的访问密钥验证
