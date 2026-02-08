# API 客户端封装总结

## ✅ 完成内容

### 1. 核心文件

| 文件 | 功能 | 说明 |
|------|------|------|
| `src/lib/api-client.ts` | 底层 fetch 封装 | 统一的请求处理、错误处理、Token 管理 |
| `src/lib/api/index.ts` | API 服务层 | 所有 API 端点的类型安全封装 |
| `src/hooks/use-api.ts` | SWR Hooks | 客户端组件数据获取 Hooks |
| `src/lib/auth.ts` | 认证工具 | Token 和用户信息管理 |

### 2. 技术选型

✅ **原生 fetch** (Next.js 增强版)
- 自动缓存和重新验证
- 支持 Server Components
- 无额外依赖

✅ **SWR** (Vercel 官方推荐)
- 自动缓存、重新验证
- 乐观更新
- 轻量级 (5KB)

✅ **TypeScript** 全栈类型安全
- 完整的类型定义
- IDE 智能提示
- 编译时错误检查

### 3. 使用场景

| 场景 | 方案 | 示例 |
|------|------|------|
| Server Components | `api.*` 直接调用 | `await api.problem.getList()` |
| Client Components (读) | `use*` Hooks | `useProblems({ page: 1 })` |
| Client Components (写) | `api.*` | `await api.code.submit(data)` |
| 表单提交 | `api.*` | `await api.auth.login(credentials)` |
| 实时交互 | `api.*` + `mutate()` | 聊天、点赞等 |

## 📚 快速开始

### Server Component 示例

```tsx
// app/problems/page.tsx
import api from '@/lib/api'

export default async function ProblemsPage() {
  const response = await api.problem.getList({ page: 1 })
  const problems = response.data

  return (
    <div>
      {problems.data.map(p => (
        <div key={p.id}>{p.title}</div>
      ))}
    </div>
  )
}
```

### Client Component 示例

```tsx
'use client'

import { useProblems } from '@/hooks/use-api'

export default function ProblemList() {
  const { data, isLoading, error } = useProblems({ difficulty: 'Easy' })

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败</div>

  return (
    <div>
      {data?.data.map(p => (
        <div key={p.id}>{p.title}</div>
      ))}
    </div>
  )
}
```

### 表单提交示例

```tsx
'use client'

import api from '@/lib/api'
import { useState } from 'react'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await api.auth.login({ email, password })
      if (response.success) {
        // 登录成功
      }
    } finally {
      setLoading(false)
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

## 🎯 核心特性

### 1. 统一的响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### 2. 自动错误处理

```typescript
try {
  const response = await api.problem.getList()
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.message, error.status)
  }
}
```

### 3. 自动 Token 管理

```typescript
// Token 自动从 localStorage 读取并添加到请求头
const response = await api.auth.getCurrentUser()
```

### 4. 类型安全

```typescript
// 完整的类型推断
const response = await api.problem.getList()
// response.data 类型为 PaginatedResponse<Problem>

const { data } = useProblems()
// data 类型为 PaginatedResponse<Problem> | undefined
```

### 5. 请求参数自动处理

```typescript
// 查询参数自动序列化
await api.problem.getList({ 
  page: 1, 
  difficulty: 'Easy',
  search: '链表' 
})
// GET /api/problems?page=1&difficulty=Easy&search=%E9%93%BE%E8%A1%A8
```

## 📦 可用的 API 方法

### 认证
- `api.auth.login(data)` - 登录
- `api.auth.register(data)` - 注册
- `api.auth.getCurrentUser()` - 获取当前用户

### 用户
- `api.user.getStats()` - 用户统计

### 题目
- `api.problem.getList(params)` - 题目列表
- `api.problem.getById(id)` - 题目详情

### 代码
- `api.code.run(data)` - 运行代码
- `api.code.submit(data)` - 提交代码

### 面试
- `api.interview.getList()` - 面试列表
- `api.interview.create(data)` - 创建面试
- `api.interview.getById(id)` - 面试详情
- `api.interview.sendMessage(id, data)` - 发送消息
- `api.interview.getTemplates()` - 面试模板
- `api.interview.delete(id)` - 删除面试

### 学习路径
- `api.learningPath.getList(userId?)` - 路径列表
- `api.learningPath.getById(id)` - 路径详情
- `api.learningPath.updateProgress(id, data)` - 更新进度

### 知识库
- `api.knowledge.getList(params)` - 文章列表
- `api.knowledge.getById(id)` - 文章详情
- `api.knowledge.getCategories()` - 分类列表

### 能力雷达
- `api.capability.get(userId?)` - 获取雷达图
- `api.capability.update(data)` - 更新雷达图

### 活动日志
- `api.activity.getList(params)` - 活动列表

## 🪝 可用的 Hooks

### 用户相关
- `useCurrentUser()` - 当前用户
- `useUserStats()` - 用户统计

### 题目相关
- `useProblems(params?)` - 题目列表
- `useProblem(id)` - 题目详情

### 面试相关
- `useInterviews()` - 面试列表
- `useInterview(id)` - 面试详情
- `useInterviewTemplates()` - 面试模板

### 学习路径
- `useLearningPaths(userId?)` - 路径列表
- `useLearningPath(id)` - 路径详情

### 知识库
- `useKnowledgeArticles(params?)` - 文章列表
- `useKnowledgeArticle(id)` - 文章详情
- `useKnowledgeCategories()` - 分类列表

### 其他
- `useCapabilityRadar(userId?)` - 能力雷达图
- `useActivities(params?)` - 活动日志

## 🔧 高级用法

### 1. 乐观更新

```typescript
const { data, mutate } = useProblems()

const handleLike = async (id: string) => {
  // 立即更新 UI
  mutate(
    { ...data!, data: [...] },
    false // 不重新验证
  )
  
  // 发送请求
  await api.problem.like(id)
  
  // 重新验证
  mutate()
}
```

### 2. 条件获取

```typescript
// 只有当 id 存在时才获取
const { data } = useProblem(id || null)
```

### 3. 手动刷新

```typescript
const { data, mutate } = useProblems()

// 手动刷新数据
<button onClick={() => mutate()}>刷新</button>
```

### 4. 依赖更新

```typescript
const { data: user } = useCurrentUser()

// 当用户变化时刷新统计
useEffect(() => {
  if (user) {
    mutate('/users/stats')
  }
}, [user])
```

## 📖 参考文档

1. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - 完整的 API 接口文档
2. **[API_CLIENT_GUIDE.md](./API_CLIENT_GUIDE.md)** - 详细使用指南
3. **[示例页面](/api-examples)** - 在线演示

## 🚀 下一步

现在你可以：

1. ✅ 在任何组件中直接使用封装好的 API
2. ✅ 享受完整的 TypeScript 类型提示
3. ✅ 使用 SWR 自动处理缓存和重新验证
4. ✅ 专注于业务逻辑，无需关心底层细节

**开始使用**:
```typescript
import api from '@/lib/api'
import { useProblems } from '@/hooks/use-api'
```

🎉 **API 客户端已经准备就绪！**
