# MallocMentor — C/C++ 智能助教平台

一个基于 Next.js 的 C/C++ 学习与面试一站式平台：系统化学习路径、Monaco 在线编程、Coze AI 代码审查、AI 模拟面试、知识库 RAG 助手、能力雷达图与成就系统。

## 技术栈

| 分层 | 选型 |
|------|------|
| 框架 | Next.js 16 (App Router) + React 19 + TypeScript |
| 样式 | Tailwind CSS 4 + shadcn/ui + next-themes |
| 数据 | PostgreSQL（Neon 兼容） + Prisma 7 |
| 认证 | NextAuth.js 5 (beta) — Credentials + GitHub OAuth |
| 数据获取 | SWR（统一收口于 `src/hooks/use-api.ts`） |
| 编辑器 | Monaco Editor |
| 图表 | Recharts |
| 沙盒 | Piston / Judge0（可配置） |
| AI | Coze（4 个 Bot：interview / codeReview / knowledge / learningPath） |
| 流式 | SSE（封装在 `src/lib/utils/sse.ts`） |

## 项目结构（重构后）

```
src/
├── app/
│   ├── api/                       # 所有 route 用 withAuth/withErrorBoundary 包裹
│   │   ├── auth/  code/  interviews/  knowledge/
│   │   ├── learning-paths/  problems/  upload/  user/
│   │   └── users/
│   ├── dashboard/                 # 5 个核心页面均按 _components + _lib 拆分
│   │   ├── page.tsx               #   page.tsx 仅做 hook 调用 + 状态编排（~70-170 行）
│   │   ├── _components/*.tsx      #   纯展示组件
│   │   └── _lib/*.ts              #   纯函数 / 类型 / 常量
│   ├── learn/  knowledge/  practice/[id]/  settings/
│   ├── interview/  interview/[id]/
│   └── login/
├── components/
│   ├── code-editor/  interview/  knowledge-assistant/
│   ├── layout/  providers/  ui/
├── hooks/
│   └── use-api.ts                 # 唯一前端数据层：apiFetch + ApiError + 25+ 域 hook
├── lib/
│   ├── api/handler.ts             # withAuth / withErrorBoundary（消除 30 个 route 样板）
│   ├── ai/coze.ts                 # Coze 客户端
│   ├── utils/
│   │   ├── api-error.ts           # 统一错误类型
│   │   ├── json-fields.ts         # 所有 Prisma JSON 列的解析入口
│   │   ├── logger.ts              # 带 scope 的结构化日志
│   │   ├── response.ts            # Response helpers
│   │   └── sse.ts                 # parseSSEStream 异步生成器
│   ├── achievements.ts  learning-path-templates.ts
│   ├── prisma.ts  sandbox.ts
├── types/api.ts
├── auth.config.ts  auth.ts  middleware.ts
└── generated/prisma/              # Prisma 客户端输出目录（custom output）

prisma/schema.prisma               # 数据模型
content/articles/                  # Markdown 知识文章源（sync 到数据库）
```

## 核心功能模块

| 路由 | 描述 |
|------|------|
| `/dashboard` | 用户概览：能力雷达图（6 维）、学习目标、最近活动、成就墙 |
| `/learn` | 系统化学习路径：阶段总览、详情大纲、AI 学习推荐、解锁/完成态 |
| `/practice` + `/practice/[id]` | 题库 + Monaco 编辑器 + 真实代码沙盒 + AI 代码审查（结构化打分） |
| `/interview` + `/interview/[id]` | AI 面试官 SSE 流式对话 + 评估报告 |
| `/knowledge` + `/knowledge/[id]` | 知识文章浏览、分类、搜索、收藏、AI 知识助手 SSE |
| `/settings` | 个人资料 / 修改密码 / 成就总览 |
| `/login` | NextAuth 登录（Credentials + GitHub） |

## 数据库模型

定义于 `prisma/schema.prisma`，关键模型：

- `User` + NextAuth `Account` / `Session`
- `CapabilityRadar` — 6 维能力评分（0-100）
- `Problem` / `CodeSubmission` — 题目与提交（含 AI 审查结果）
- `InterviewSession` / `InterviewTemplate` — 面试会话（消息存 JSON）
- `LearningPath` / `UserLearningProgress` — 学习路径（步骤存 JSON）
- `KnowledgeArticle` / `UserFavorite` — 知识文章 + 收藏
- `UserAchievement` / `ActivityLog` — 成就系统 + 活动流水

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env
# 至少填：DATABASE_URL（Postgres）、AUTH_SECRET、COZE_API_KEY、COZE_BOT_*_ID
#       SANDBOX_PROVIDER=piston|judge0、PISTON_API_URL（如自托管）

# 3. 同步数据库 + 种子
pnpm db:push
pnpm db:seed
pnpm db:sync-articles    # 把 content/articles/*.md 同步进 KnowledgeArticle

# 4. 启动
pnpm dev                 # http://localhost:3000
```

## 常用命令

```bash
pnpm dev                 # 开发服务器
pnpm build               # 生成 Prisma client + 生产构建
pnpm start               # 启动生产服务器
pnpm lint                # ESLint
pnpm db:push             # 同步 schema 到数据库
pnpm db:seed             # 注入种子数据
pnpm db:sync-articles    # 同步知识库 markdown
npx prisma studio        # 可视化查看数据库
```

## 架构约定（开发前必读）

> 这些约定在 2026 年的重构中确立，违反会被代码审查打回。

1. **API 路由必须用 wrapper** — 所有 `src/app/api/*/route.ts` 必须通过
   `withAuth` 或 `withErrorBoundary`（`src/lib/api/handler.ts`）包裹。Handler
   内部不写 try/catch、不写手动 `await params`、不手动 `getServerSession`。

2. **客户端数据获取只走 SWR hook** — 一律使用 `src/hooks/use-api.ts` 暴露的
   域 hook（`useUserStats` / `useProblems` / `useInterview` / …）。**禁止**：
   - 直接 `fetch('/api/...')`
   - 重新引入已删除的 `src/lib/api-client.ts` 或 `src/lib/api/index.ts`
   - 在组件里手动维护 `loading/error/data` 三件套

3. **写操作走 mutation hook + 自动 invalidate** — `useApiMutation` 已经接好
   `invalidateKeys`，写完不需要手动刷新列表。

4. **JSON 字段解码集中处理** — Prisma JSON 列的解码必须经过
   `src/lib/utils/json-fields.ts`（`parseTags` / `parseTestCases` /
   `parseInterviewMessages` / …）。**不要**散落 `JSON.parse`。

5. **SSE 解析走异步生成器** — 任何 SSE 消费方都要用
   `parseSSEStream(response.body)`（`src/lib/utils/sse.ts`），不要手撕
   `data:` 行。

6. **page.tsx 拆分约定** — 当 `page.tsx` 超过 ~200 行就要拆：
   ```
   <route>/page.tsx          # 仅做 hook 调用 + 状态编排
   <route>/_components/*.tsx # 展示组件
   <route>/_lib/*.ts         # 纯函数 + 类型 + 常量（可单测）
   ```
   现有的 `dashboard / learn / knowledge / practice/[id] / settings` 都已按
   此规范拆分，请参照实现。

## 提交规范

```
feat:     新功能
fix:      Bug 修复
docs:     文档更新
refactor: 重构
chore:    构建 / 工具
style:    格式调整（不影响行为）
test:     测试相关
```

## 参考链接

- [Next.js 文档](https://nextjs.org/docs)
- [Prisma 文档](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [SWR](https://swr.vercel.app)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Coze API](https://www.coze.com)
