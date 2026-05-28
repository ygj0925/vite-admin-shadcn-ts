# 前端项目功能复刻设计文档

## 概述

将 `D:\code\continew\frontend-bck`（Vue项目）的功能复刻到当前React项目中。

## 项目对比

| 项目 | 技术栈 | 文件数 |
|------|--------|--------|
| 源项目 | Vue 3 + TypeScript | 206个Vue文件 |
| 当前项目 | React 19 + TypeScript | 157个文件 |

## 需要复刻的内容

### 1. 补全缺失页面

源项目有但当前项目缺少的页面：

#### 1.1 关于页面
- `about/document/api` - API文档页面
- `about/document/changelog` - 更新日志页面

#### 1.2 登录相关
- `login/components/account` - 账号登录组件
- `login/components/background` - 背景组件
- `login/components/email` - 邮箱登录组件
- `login/components/modifyPassword` - 修改密码组件
- `login/components/phone` - 手机登录组件
- `login/pwdExpired` - 密码过期页面
- `login/social` - 社交登录页面

#### 1.3 监控模块
- `monitor/log` - 监控日志页面

#### 1.4 系统管理
- `system/config` - 系统配置页面
- `system/dict/tree` - 字典树页面
- `system/file/main/FileMain` - 文件主组件
- `system/notice/add` - 添加通知页面
- `system/notice/add/components` - 添加通知组件
- `system/notice/view` - 查看通知页面
- `system/notice/view/components` - 查看通知组件
- `system/role/tree` - 角色树页面
- `system/user/dept` - 用户部门页面

#### 1.5 用户消息
- `user/message/components/view` - 消息查看组件
- `user/message/components/view/components` - 消息查看子组件

### 2. 补全缺失组件

源项目有但当前项目缺少的组件：

#### 2.1 通用组件
- `Avatar` - 头像组件
- `Breadcrumb` - 面包屑组件
- `CellCopy` - 单元格复制组件
- `DateRangePicker` - 日期范围选择器
- `FilePreview` - 文件预览组件
- `GiCell` - 单元格组件
- `GiCodeView` - 代码查看组件
- `GiDot` - 点组件
- `GiEditTable` - 可编辑表格
- `GiFooter` - 页脚组件
- `GiForm` - 表单组件
- `GiIconBox` - 图标盒子
- `GiIconSelector` - 图标选择器
- `GiIframe` - Iframe组件
- `GiOption` - 选项组件
- `GiOptionItem` - 选项项组件
- `GiPageLayout` - 页面布局
- `GiSpace` - 间距组件
- `GiSplitButton` - 分割按钮
- `GiSplitPane` - 分割面板
- `GiSvgIcon` - SVG图标
- `GiTable` - 表格组件
- `GiTag` - 标签组件
- `GiThemeBtn` - 主题按钮
- `JsonPretty` - JSON美化组件
- `MultipartUpload` - 分片上传组件
- `ParentView` - 父视图组件
- `SplitPanel` - 分割面板
- `TextCopy` - 文本复制组件

### 3. 功能细节对齐

需要对齐的功能细节：

#### 3.1 登录功能
- 账号密码登录
- 手机号登录
- 邮箱登录
- 社交登录（微信、QQ等）
- 验证码功能
- 记住密码
- 密码过期处理

#### 3.2 系统管理
- 用户管理：部门树筛选
- 角色管理：角色树
- 字典管理：字典树
- 文件管理：文件预览
- 通知管理：添加/查看通知

#### 3.3 监控模块
- 操作日志详情
- 登录日志详情

### 4. 迁移hooks/stores

需要迁移的hooks和stores结构：

#### 4.1 Hooks
- `app` - 应用相关hooks
- `modules` - 模块相关hooks

#### 4.2 Stores
- `modules` - 模块相关stores

## 实现策略

### 阶段1：补全核心页面
1. 登录相关组件和页面
2. 系统管理缺失页面
3. 监控模块缺失页面

### 阶段2：补全通用组件
1. 通用UI组件
2. 业务组件

### 阶段3：功能细节对齐
1. 登录功能完善
2. 系统管理功能完善
3. 监控模块功能完善

### 阶段4：迁移hooks/stores
1. 迁移hooks结构
2. 迁移stores结构

## 技术要点

### Vue到React转换
- Vue组件 → React组件
- Vue Composition API → React Hooks
- Vue Router → React Router
- Pinia → Zustand

### UI组件库
- 源项目：Arco Design Vue
- 当前项目：shadcn/ui (Radix UI)

### 样式方案
- 源项目：Less
- 当前项目：Tailwind CSS v4

## 优先级

1. **高优先级**：登录相关组件和页面
2. **中优先级**：系统管理缺失页面
3. **低优先级**：通用组件和hooks/stores迁移

## 预计工作量

- 补全缺失页面：约20个页面/组件
- 补全通用组件：约30个组件
- 功能细节对齐：约10个功能点
- 迁移hooks/stores：约5个模块

总计：约65个文件需要创建或修改
