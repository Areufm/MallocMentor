# API 客户端使用指南

## 技术栈选择

### Next.js 最佳实践

✅ **推荐使用原生 `fetch`**
- Next.js 对 fetch 做了增强（自动缓存、重新验证）
- 支持 Server Components
- 无需额外依赖
- 支持 React Server Components 的流式渲染

✅ **客户端数据获取使用 SWR**
- Vercel 官方推荐
- 自动缓存、重新验证
- 乐观更新
- 轻量级

❌ **不推荐使用 axios**
- 额外的包体积
- 与 Next.js Server Components 不兼容
- fetch 已经足够强大

## 文件结构

```
src/
├── lib/
│   ├── api-client.ts           # 底层 fetch 封装
│   ├── api/
│   │   └── index.ts            # API 服务层（所有接口）
│   └── auth.ts                 # 认证工具
└── hooks/
    └── use-api.ts              # SWR Hooks（客户端组件）
```

## 使用方式

### 1. Server Components（服务端组件）

**直接使用 API 服务层**

```tsx
// app/problems/page.tsx
import api from '@/lib/api'

export default async function ProblemsPage() {
  // 服务端直接调用，自动缓存
  const response = await api.problem.getList({ page: 1, pageSize: 10 })
  const problems = response.data

  return (
    <div>
      {problems.data.map(problem => (
        <div key={problem.id}>{problem.title}</div>
      ))}
    </div>
  )
}
```

**缓存控制**

```tsx
// 重新验证缓存
export const revalidate = 60 // 60秒后重新验证

// 动态渲染（每次请求都获取最新数据）
export const dynamic = 'force-dynamic'

// 或在 fetch 中设置
const response = await fetch('/api/problems', {
  next: { revalidate: 60 }
})
```

### 2. Client Components（客户端组件）

**使用 SWR Hooks**

```tsx
'use client'

import { useProblems } from '@/hooks/use-api'

export default function ProblemList() {
  const { data, error, isLoading } = useProblems({ 
    page: 1, 
    difficulty: 'Easy' 
  })

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败</div>
  if (!data) return null

  return (
    <div>
      {data.data.map(problem => (
        <div key={problem.id}>{problem.title}</div>
      ))}
    </div>
  )
}
```

**手动调用 API（如表单提交）**

```tsx
'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { useProblems } from '@/hooks/use-api'

export default function SubmitCode() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { mutate } = useProblems() // 获取 mutate 函数用于刷新数据

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await api.code.submit({
        problemId: '1',
        code,
        language: 'cpp',
      })
      
      if (response.success) {
        alert('提交成功！')
        // 刷新题目列表（如果需要）
        mutate()
      }
    } catch (error) {
      alert('提交失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <textarea value={code} onChange={e => setCode(e.target.value)} />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? '提交中...' : '提交'}
      </button>
    </div>
  )
}
```

## 详细示例

### 示例 1: 题目列表页面（服务端渲染）

```tsx
// app/practice/page.tsx
import api from '@/lib/api'
import ProblemList from './problem-list'

export default async function PracticePage({
  searchParams,
}: {
  searchParams: { page?: string; difficulty?: string }
}) {
  const page = Number(searchParams.page) || 1
  const difficulty = searchParams.difficulty

  // 服务端获取数据
  const response = await api.problem.getList({
    page,
    pageSize: 10,
    difficulty,
  })

  return (
    <div>
      <h1>题目列表</h1>
      <ProblemList initialData={response.data} />
    </div>
  )
}
```

### 示例 2: 题目详情（客户端交互）

```tsx
'use client'

import { useProblem } from '@/hooks/use-api'
import api from '@/lib/api'

export default function ProblemDetail({ id }: { id: string }) {
  const { data: problem, isLoading } = useProblem(id)
  const [code, setCode] = useState('')

  const handleRun = async () => {
    const response = await api.code.run({
      code,
      language: 'cpp',
    })
    
    console.log(response.data?.output)
  }

  if (isLoading) return <div>加载中...</div>
  if (!problem) return <div>题目不存在</div>

  return (
    <div>
      <h1>{problem.title}</h1>
      <p>{problem.description}</p>
      <button onClick={handleRun}>运行代码</button>
    </div>
  )
}
```

### 示例 3: 面试聊天（实时交互）

```tsx
'use client'

import { useState } from 'react'
import { useInterview } from '@/hooks/use-api'
import api from '@/lib/api'

export default function InterviewChat({ sessionId }: { sessionId: string }) {
  const { data: session, mutate } = useInterview(sessionId)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || sending) return

    setSending(true)
    try {
      const response = await api.interview.sendMessage(sessionId, {
        sessionId,
        message,
      })

      // 乐观更新：立即显示用户消息
      if (session) {
        mutate({
          ...session,
          messages: [
            ...session.messages,
            { id: Date.now().toString(), role: 'user', content: message, timestamp: new Date().toISOString() },
            response.data!,
          ],
        }, false)
      }

      setMessage('')
    } catch (error) {
      alert('发送失败')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      {session?.messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage} disabled={sending}>
        发送
      </button>
    </div>
  )
}
```

### 示例 4: 表单提交（登录）

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { setAuth } from '@/lib/auth'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.auth.login({ email, password })
      
      if (response.success && response.data) {
        // 保存认证信息
        setAuth(response.data.token, response.data.user)
        
        // 跳转到仪表盘
        router.push('/dashboard')
      }
    } catch (error) {
      alert('登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="邮箱"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="密码"
      />
      <button type="submit" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  )
}
```

## SWR 高级用法

### 1. 条件获取

```tsx
// 只有当 userId 存在时才获取
const { data } = useApi(
  userId ? `/users/${userId}` : null,
  () => api.user.getById(userId!)
)
```

### 2. 依赖刷新

```tsx
const { data: user } = useCurrentUser()
const { data: stats } = useUserStats()

// 当用户信息变化时，刷新统计数据
useEffect(() => {
  if (user) {
    mutate('/users/stats')
  }
}, [user])
```

### 3. 全局配置

```tsx
// app/layout.tsx
import { SWRConfig } from 'swr'

export default function RootLayout({ children }) {
  return (
    <SWRConfig
      value={{
        refreshInterval: 0,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
      }}
    >
      {children}
    </SWRConfig>
  )
}
```

### 4. 乐观更新

```tsx
const { data, mutate } = useProblems()

const handleLike = async (problemId: string) => {
  // 乐观更新：立即更新 UI
  mutate(
    data => ({
      ...data!,
      data: data!.data.map(p =>
        p.id === problemId ? { ...p, likes: p.likes + 1 } : p
      ),
    }),
    false // 不触发重新验证
  )

  // 发送请求
  await api.problem.like(problemId)
  
  // 重新验证
  mutate()
}
```

## 错误处理

### 1. 全局错误处理

```tsx
// lib/api-client.ts 已经实现了统一的错误处理
try {
  const response = await api.problem.getList()
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API 错误:', error.message, error.status)
  }
}
```

### 2. 组件级错误处理

```tsx
const { data, error } = useProblems()

if (error) {
  return <ErrorMessage error={error} />
}
```

## 性能优化

### 1. 预加载数据

```tsx
// 鼠标悬停时预加载
<Link
  href={`/problems/${id}`}
  onMouseEnter={() => {
    // 预加载题目详情
    api.problem.getById(id)
  }}
>
  查看详情
</Link>
```

### 2. 分页优化

```tsx
const [page, setPage] = useState(1)
const { data } = useProblems({ page, pageSize: 20 })

// 预加载下一页
useEffect(() => {
  if (data && page < data.totalPages) {
    api.problem.getList({ page: page + 1, pageSize: 20 })
  }
}, [page, data])
```

## 环境变量

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 生产环境
# NEXT_PUBLIC_API_URL=https://api.yoursite.com
```

## 总结

| 场景 | 使用方式 | 示例 |
|------|----------|------|
| Server Components | `api.*` 直接调用 | `await api.problem.getList()` |
| Client Components（读取） | `use*` Hooks | `useProblems()` |
| Client Components（写入） | `api.*` + mutate | `await api.code.submit()` |
| 表单提交 | `api.*` | `await api.auth.login()` |
| 实时交互 | `api.*` + `mutate()` | 聊天、点赞 |

**核心原则**：
- ✅ Server Components 优先
- ✅ 使用原生 fetch（通过封装）
- ✅ SWR 处理客户端数据获取
- ✅ 类型安全（TypeScript）
- ✅ 统一的错误处理
