# API 接口文档

## 概述

本文档描述了 C/C++ 智能助教平台的所有后端 API 接口。当前所有接口均为 Mock 实现，返回模拟数据。

**基础 URL**: `http://localhost:3000/api`

## 认证相关

### 1. 用户登录
```
POST /api/auth/login
```

**请求体**:
```typescript
{
  email: string
  password: string
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    user: User,
    token: string
  },
  message: "登录成功"
}
```

### 2. 用户注册
```
POST /api/auth/register
```

**请求体**:
```typescript
{
  email: string
  password: string
  name: string
}
```

**响应**: 同登录接口

### 3. 获取当前用户
```
GET /api/auth/me
```

**Headers**: `Authorization: Bearer {token}`

**响应**:
```typescript
{
  success: true,
  data: User
}
```

## 用户相关

### 4. 获取用户统计
```
GET /api/users/stats
```

**响应**:
```typescript
{
  success: true,
  data: {
    problemsCompleted: number
    totalProblems: number
    studyHours: number
    passRate: number
    achievements: number
    streak: number
    rank: number
  }
}
```

## 题目相关

### 5. 获取题目列表
```
GET /api/problems
```

**查询参数**:
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 10）
- `category`: 分类筛选（可选）
- `difficulty`: 难度筛选（可选）
- `search`: 搜索关键词（可选）

**响应**:
```typescript
{
  success: true,
  data: {
    data: Problem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}
```

### 6. 获取题目详情
```
GET /api/problems/:id
```

**响应**:
```typescript
{
  success: true,
  data: Problem
}
```

## 代码相关

### 7. 提交代码
```
POST /api/code/submit
```

**请求体**:
```typescript
{
  problemId: string
  code: string
  language: 'c' | 'cpp'
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    id: string
    status: 'Passed' | 'Failed' | 'Error'
    testResults: TestResult[]
    aiReview: AICodeReview
  }
}
```

### 8. 运行代码
```
POST /api/code/run
```

**请求体**:
```typescript
{
  code: string
  language: 'c' | 'cpp'
  input?: string
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    output: string
    error?: string
    executionTime: number
    memoryUsed: number
  }
}
```

## 面试相关

### 9. 获取面试列表
```
GET /api/interviews
```

**响应**:
```typescript
{
  success: true,
  data: InterviewSession[]
}
```

### 10. 创建面试会话
```
POST /api/interviews
```

**请求体**:
```typescript
{
  title: string
  type: 'technical' | 'behavioral'
  templateId?: string
}
```

**响应**:
```typescript
{
  success: true,
  data: InterviewSession
}
```

### 11. 获取面试详情
```
GET /api/interviews/:id
```

**响应**:
```typescript
{
  success: true,
  data: InterviewSession
}
```

### 12. 发送面试消息
```
POST /api/interviews/:id/message
```

**请求体**:
```typescript
{
  message: string
}
```

**响应**:
```typescript
{
  success: true,
  data: InterviewMessage  // AI 回复
}
```

### 13. 获取面试模板
```
GET /api/interviews/templates
```

**响应**:
```typescript
{
  success: true,
  data: InterviewTemplate[]
}
```

### 14. 删除面试会话
```
DELETE /api/interviews/:id
```

**响应**:
```typescript
{
  success: true,
  data: { id: string }
}
```

## 学习路径

### 15. 获取学习路径列表
```
GET /api/learning-paths
```

**查询参数**:
- `userId`: 用户 ID（可选）

**响应**:
```typescript
{
  success: true,
  data: LearningPath[]
}
```

### 16. 获取学习路径详情
```
GET /api/learning-paths/:id
```

**响应**:
```typescript
{
  success: true,
  data: LearningPath
}
```

### 17. 更新学习进度
```
POST /api/learning-paths/:id/progress
```

**请求体**:
```typescript
{
  stepId: number
  completed: boolean
}
```

**响应**:
```typescript
{
  success: true,
  data: { updated: true }
}
```

## 知识库

### 18. 获取知识文章列表
```
GET /api/knowledge
```

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `category`: 分类筛选
- `difficulty`: 难度筛选
- `search`: 搜索关键词

**响应**:
```typescript
{
  success: true,
  data: {
    data: KnowledgeArticle[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}
```

### 19. 获取文章详情
```
GET /api/knowledge/:id
```

**响应**:
```typescript
{
  success: true,
  data: KnowledgeArticle
}
```

### 20. 获取知识库分类
```
GET /api/knowledge/categories
```

**响应**:
```typescript
{
  success: true,
  data: KnowledgeCategory[]
}
```

## 能力雷达图

### 21. 获取能力雷达图
```
GET /api/capability-radar
```

**查询参数**:
- `userId`: 用户 ID（可选）

**响应**:
```typescript
{
  success: true,
  data: {
    id: string
    userId: string
    basicSyntax: number        // 0-100
    memoryManagement: number   // 0-100
    dataStructures: number     // 0-100
    oop: number                // 0-100
    stlLibrary: number         // 0-100
    systemProgramming: number  // 0-100
    updatedAt: string
  }
}
```

### 22. 更新能力雷达图
```
POST /api/capability-radar
```

**请求体**: `CapabilityRadar` 对象

**响应**: 同上

## 活动日志

### 23. 获取活动日志
```
GET /api/activities
```

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `type`: 活动类型筛选（可选）
- `userId`: 用户 ID（可选）

**响应**:
```typescript
{
  success: true,
  data: {
    data: ActivityLog[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}
```

## 通用响应格式

### 成功响应
```typescript
{
  success: true
  data: any
  message?: string
}
```

### 错误响应
```typescript
{
  success: false
  error: string
  message?: string
}
```

### HTTP 状态码

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `404`: 资源不存在
- `409`: 冲突（如邮箱已存在）
- `500`: 服务器错误

## 类型定义

所有 API 的 TypeScript 类型定义都在 `src/types/api.ts` 文件中。

## 使用示例

### 前端调用示例

```typescript
// 登录
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'demo@example.com', password: '123456' })
})
const data = await response.json()

// 获取题目列表
const response = await fetch('/api/problems?page=1&pageSize=10&difficulty=Easy')
const data = await response.json()

// 提交代码
const response = await fetch('/api/code/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    problemId: '1',
    code: '// your code here',
    language: 'cpp'
  })
})
const data = await response.json()
```

## 注意事项

1. **Mock 数据**: 当前所有接口都返回 Mock 数据，数据不会真正保存
2. **认证**: 登录后返回的 token 是 mock 的，实际使用时需要实现真正的 JWT
3. **延迟**: API 响应都添加了延迟（300-2000ms）来模拟真实网络请求
4. **分页**: 支持分页的接口都使用 `page` 和 `pageSize` 参数
5. **Coze AI**: 需要后续集成真实的 Coze API 来实现 AI 功能

## 后续开发

待集成真实实现：
- [ ] 用户认证（JWT）
- [ ] 数据库持久化
- [ ] Coze AI 集成
- [ ] 代码执行沙箱
- [ ] 文件上传
- [ ] WebSocket 实时通信（面试聊天）
