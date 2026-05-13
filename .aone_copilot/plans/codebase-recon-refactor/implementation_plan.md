### codebase-recon-refactor ###
对 MallocMentor 进行全栈分阶段重构：清理死代码 → 抽公共中间件 → 复活 SWR → 拆巨型 page → 引入测试体系，每阶段独立提交可回滚。

# MallocMentor 全栈重构计划

> [!NOTE]
> 本文档同时承担 `aca-codebase-recon` 的 **Context Brief** 与 `aca-spec-proposal` 的 **可执行计划** 两个角色。
> 项目类型：个人毕设，无线上用户。安全策略：激进重构 + Git 分支兜底 + 每阶段独立提交。

---

## 系统概览

**MallocMentor** 是一个面向 C/C++ 学习者的智能辅导平台（毕设项目）：题目练习 + AI 代码审查 + AI 模拟面试 + 知识库 + 学习路径推荐。

技术栈：Next.js 16 (App Router) + React 19 + Prisma 7 + PostgreSQL + NextAuth 5 (beta) + Coze AI + Piston/Judge0 沙盒。代码规模 src/ 78 文件，30 个 API route，无任何测试。

---

## 当前架构（侦察成果）

```
┌──────────────────────────────────────────────────────────────┐
│                     Client Pages (Next.js)                    │
│   practice  dashboard  learn  knowledge  settings  interview  │
│   ─────────────────────────────────────────────────────────   │
│   全是 "use client" + useState + useEffect + 手动 loading     │
│   有的用 xxxApi.getList()，有的直接 fetch('/api/...')         │
└──┬─────────────┬─────────────────────────────┬───────────────┘
   │             │                             │
   ▼             ▼                             ▼
┌───────────┐ ┌──────────────────┐  ┌──────────────────────────┐
│ hooks/    │ │ lib/api/index.ts │  │ 直接 fetch (settings,    │
│ use-api   │ │ (按域分组的薄壳) │  │  chat-window, widget)    │
│ (SWR)     │ │                  │  │                          │
│ 几乎没用  │ │   ↓              │  │                          │
└───────────┘ │ lib/api-client   │  │                          │
              │ (fetch 包装)     │  │                          │
              └──────┬───────────┘  └──────────┬───────────────┘
                     │                         │
                     ▼                         ▼
       ┌───────────────────────────────────────────────────────┐
       │  Next.js Route Handlers — src/app/api/**/route.ts     │
       │  30 个文件，重复 auth/try-catch/console.error 模板    │
       └───┬────────────────┬───────────────┬──────────────────┘
           ▼                ▼               ▼
      ┌─────────┐    ┅─────────────┐  ┌──────────┐
      │ Prisma  │    │ Coze SSE     │  │ Sandbox  │
      │ singleton│   │(lib/ai/coze) │  │ (Piston) │
      └─────────┘    └──────────────┘  └──────────┘
```

**架构模式一致性：MEDIUM** — 数据获取有 3 套方案并存（SWR Hook / xxxApi+useState / 裸 fetch），是最大的"shit mountain"信号。

---

## 关键约束（Phase 2 抽取）

- **个人毕设项目**：无真实用户，可以激进重构；但毕设答辩前不能跑挂。
- **答辩 demo 依赖**：dashboard、practice、interview、learn、knowledge、settings 6 个页面是核心 demo 路径，重构后必须人工走查一遍。
- **AI 服务降级路径不能丢**：Coze 未配置时需要有可用的"未配置提示"（不能崩），但写死的 5 条 mockReplies 应当移除。
- **测试空白**：当前 0 测试。重构必须为每个被抽取的纯函数 / 工具补单测，作为后续防线。
- **数据库 schema 不动**：本次重构不改 Prisma schema，避免 db migration 风险。

---

## 变更目标（Top 12 异味，按优先级）

| # | 问题 | 文件证据 | 优先级 |
|---|------|---------|--------|
| 1 | mock-data.ts 543 行死代码（零引用） | `src/lib/mock-data.ts` | P0 |
| 2 | actions/submission.ts 已 deprecated 仅注释 | `src/app/actions/submission.ts` | P0 |
| 3 | lib/auth.ts 仅一行 re-export 无价值间接层 | `src/lib/auth.ts` | P0 |
| 4 | createSuccessResponse 在 mock-data 与 utils/response 中双重定义 | 两个文件 | P0 |
| 5 | 30 个 route 重复 auth/try-catch/console.error 模板 | `src/app/api/**/route.ts` | P1 |
| 6 | JSON 字段散落手写 JSON.parse | tags / steps / messages 等多处 | P1 |
| 7 | SSE 解析逻辑前后端各写一份 | chat-window / chat-widget / coze.ts | P1 |
| 8 | 数据获取三套并行，SWR 几乎没用 | api-client + api/index + use-api + 裸 fetch | P1 |
| 9 | 巨型 page（learn 617 / practice 519 / dashboard 500 / settings 499 / knowledge 477） | `src/app/**/page.tsx` | P2 |
| 10 | 业务派生函数挂在 page 顶层 | dashboard 的 toRadarData/calcOverallScore 等 | P2 |
| 11 | 硬编码 mockReplies 留在 prod 路径 | `src/app/api/interviews/[id]/message/route.ts` | P2 |
| 12 | 0 测试覆盖 | 全仓库 | P3 |

---

## 各页面/模块爆炸半径

```
BLAST RADIUS — 数据获取层重构（影响最大）
═══════════════════════════════════════════
直接受影响：
  - 所有 6 个核心页面（必须改 fetch 调用方式）
  - chat-window.tsx / chat-widget.tsx（SSE 调用方式）
  - settings/page.tsx 内 fetch('/api/upload') 与 fetch('/api/user/update')

间接受影响：
  - hooks/use-api.ts（要么扩展要么删除）
  - lib/api/index.ts（保留作为类型化客户端）
  - lib/api-client.ts（保留作为底层）

测试安全网：WEAK — 0 单测，仅靠人工 demo 走查
回滚策略：每阶段单独 git commit，可 revert 到任意阶段
```

```
BLAST RADIUS — API Route 中间件抽取
═══════════════════════════════════════════
直接受影响：21 个含 getCurrentUserId 的 route
间接受影响：response 形态不变（外部 API 契约稳定）
风险：中间件实现错误可能导致全部 401
```

---

## 推荐策略：5 阶段渐进式重构

> [!IMPORTANT]
> **每阶段独立分支 + 独立 commit + 完成后人工 demo 走查 6 个核心页面 → 通过才进下一阶段**

### Strategy: Surgical Strike + Branch by Abstraction
- 死代码删除用 **Surgical Strike**（小、可逆、瞬间见效）
- 中间件 / withAuth 用 **Branch by Abstraction**（先建抽象层，再逐文件迁移）
- 巨型 page 拆分用 **Strangler Fig**（新组件并行存在，逐块替换）

---

## 阶段详细方案

### 阶段 1 — 死代码清理（P0，零风险）

**目标**：移除明确无引用的死代码，减少 ~600 行认知负担。

#### [DELETE] [mock-data.ts](file:///Users/xiaohongmao/HDU/MallocMentor/src/lib/mock-data.ts)
- 全仓库 grep 零引用
- 顺带消除 `createSuccessResponse` / `createErrorResponse` 的双重定义

#### [DELETE] [submission.ts](file:///Users/xiaohongmao/HDU/MallocMentor/src/app/actions/submission.ts)
- 文件本身已标注 @deprecated，仅 11 行注释
- 顺带删除空目录 `src/app/actions/`

#### [DELETE] [auth.ts](file:///Users/xiaohongmao/HDU/MallocMentor/src/lib/auth.ts)
- 仅一行 `export { signIn, signOut, useSession } from "next-auth/react"`
- 找出所有 `from '@/lib/auth'` 改为 `from 'next-auth/react'`

**验证**：`pnpm build` 通过 + 6 个核心页面手工走查。

---

### 阶段 2 — API Route 公共层抽取（P1，核心收益）

**目标**：把 21 个 route 的 auth/try-catch/error 样板抽成 `withAuth` HOF + 统一 logger。

#### [NEW] [api-handler.ts](file:///Users/xiaohongmao/HDU/MallocMentor/src/lib/api/handler.ts)

提供两个核心导出：

```typescript
// 需要登录的 handler 包装
export function withAuth<T>(
  handler: (ctx: { userId: string; req: NextRequest; params: T }) => Promise<Response>
): (req: NextRequest, segCtx: { params: Promise<T> }) => Promise<Response>

// 不需登录的 handler 包装（统一 try/catch + 错误日志）
export function withErrorBoundary<T>(
  handler: (ctx: { req: NextRequest; params: T }) => Promise<Response>
): (req: NextRequest, segCtx: { params: Promise<T> }) => Promise<Response>
```

行为：
- 自动 await `params`（Next 15+ 异步 params）
- 未登录返回统一 401 `{ success:false, error:'未登录' }`
- 抛错自动 catch + 调用 `logger.error(routePath, err)` + 返回 500 `{ success:false, error:'服务器错误' }`
- 业务可抛 `new ApiError(message, status)` 走自定义错误码

#### [NEW] [logger.ts](file:///Users/xiaohongmao/HDU/MallocMentor/src/lib/utils/logger.ts)
统一替换散落的 `console.error('xxx error:', err)`。开发环境彩色，生产环境结构化。

#### [NEW] [api-error.ts](file:///Users/xiaohongmao/HDU/MallocMentor/src/lib/utils/api-error.ts)
```typescript
export class ApiError extends Error {
  constructor(public statusCode: number, message: string) { super(message) }
}
```

#### [MODIFY] 21 个 route 文件
逐个迁移示例（`users/stats/route.ts`）：

```diff
- export async function GET(request: NextRequest) {
-   try {
-     const userId = await getCurrentUserId()
-     if (!userId) {
-       return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
-     }
-     const [...] = await Promise.all([...])
-     return NextResponse.json(createSuccessResponse({...}))
-   } catch (error) {
-     console.error('Get user stats error:', error)
-     return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
-   }
- }
+ export const GET = withAuth(async ({ userId }) => {
+   const [...] = await Promise.all([...])
+   return NextResponse.json(createSuccessResponse({...}))
+ })
```

**验证**：每改一个 route，curl 该接口确认 200/401 行为不变 + dashboard demo 完整跑一次。

---

### 阶段 3 — JSON 字段 + SSE 解析收口（P1）

#### [NEW] [json-fields.ts](file:///Users/xiaohongmao/HDU/MallocMentor/src/lib/utils/json-fields.ts)
封装 Prisma 字符串 JSON 字段的序列化/反序列化：

```typescript
export function parseJsonField<T>(raw: string, fallback: T): T
export function parseTags(raw: string): string[]
export function parseLearningSteps(raw: string): LearningStep[]
export function parseInterviewMessages(raw: string): InterviewMessage[]
```

替换所有 `JSON.parse(article.tags)` / `JSON.parse(session.messages)` 等散落写法。

#### [NEW] [sse.ts](file:///Users/xiaohongmao/HDU/MallocMentor/src/lib/utils/sse.ts)
封装 client 端通用 SSE 解析：

```typescript
export async function* parseSSEStream(
  response: Response
): AsyncGenerator<SSEEvent>
// 调用方：for await (const evt of parseSSEStream(res)) { ... }
```

行为：
- 自动处理 `data: ` 前缀、`[DONE]`、空行、JSON 解析失败跳过
- 区分 `{ type: 'session', sessionId }` / `{ type: 'error' }` / 字符串文本片段

#### [MODIFY] 复用点：
- `src/components/interview/chat-window.tsx`
- `src/components/knowledge-assistant/chat-widget.tsx`

**验证**：面试和知识助手两个 SSE 场景手动对话各 3 轮。

---

### 阶段 4 — 数据获取层统一 + 巨型 page 拆分（P2，最大代码改动）

#### 4.1 数据层定调：保留 SWR Hook 作为唯一推荐方式

> [!IMPORTANT]
> **决策：删除 `lib/api/index.ts` + `lib/api-client.ts` 直接调用方式，全部走 `useApi` Hook。**
> 写操作（mutation）走新增的 `useApiMutation`。

#### [MODIFY] [use-api.ts](file:///Users/xiaohongmao/HDU/MallocMentor/src/hooks/use-api.ts)
扩展为完整的数据层：
- 保留所有 `useXxx` 读 hook
- 新增 `useApiMutation<TArg, TData>(fn, { onSuccess, invalidate })` 写 hook
- 新增 `mutate` keys 常量统一管理（`SWR_KEYS.problems` 等）

#### [DELETE] [api/index.ts](file:///Users/xiaohongmao/HDU/MallocMentor/src/lib/api/index.ts) — 等所有 page 迁移完后删除
#### [DELETE] [api-client.ts](file:///Users/xiaohongmao/HDU/MallocMentor/src/lib/api-client.ts) — 同上

> [!WARNING]
> 这是激进决策。如不希望删除"类型化 API 客户端"层，可改为保留 `api-client` + 让 `useApi` hook 内部调用它，对外只暴露 hook。

#### 4.2 巨型 page 拆分（Strangler Fig）

每个超 400 行的 page，按以下模式拆分：

```
src/app/dashboard/page.tsx (500 行)
  ↓ 拆成
src/app/dashboard/page.tsx                    (~80 行 — 仅组合)
src/app/dashboard/_components/
  ├── stats-cards.tsx                         (~80 行)
  ├── capability-radar-card.tsx               (~120 行)
  ├── recent-activities-card.tsx              (~80 行)
  ├── learning-goals-card.tsx                 (~80 行)
  └── achievements-card.tsx                   (~60 行)
src/app/dashboard/_lib/
  ├── radar-utils.ts                          (toRadarData / calcOverallScore / findTopDimension)
  ├── activity-format.ts                      (formatRelativeTime / getActivityDotClass)
  └── learning-goals.ts                       (toLearningGoal)
```

**要拆的 page**：
- `dashboard/page.tsx` (500 行)
- `learn/page.tsx` (617 行)
- `practice/[id]/page.tsx` (519 行)
- `settings/page.tsx` (499 行)
- `knowledge/page.tsx` (477 行)
- `interview/page.tsx` (368 行)（次要）

#### [MODIFY] [route.ts (interviews/message)](file:///Users/xiaohongmao/HDU/MallocMentor/src/app/api/interviews/[id]/message/route.ts)
顺带移除硬编码 mockReplies，未配置 Coze 时返回明确的"AI 服务未配置"提示。

**验证**：每拆完一个 page，对比 git diff 截图前后 demo 走查一致。

---

### 阶段 5 — 测试基建 + 关键纯函数单测（P3）

#### [NEW] [vitest.config.ts](file:///Users/xiaohongmao/HDU/MallocMentor/vitest.config.ts)
引入 Vitest（与 Next/SWC 兼容好，启动快），不用 Jest。

#### [NEW] tests 目录结构
```
src/lib/utils/__tests__/
  ├── json-fields.test.ts
  ├── sse.test.ts
  └── response.test.ts
src/lib/__tests__/
  ├── achievements.test.ts        (条件判定纯函数)
  └── ai/coze.test.ts             (parseJsonAnswer)
src/app/dashboard/_lib/__tests__/
  ├── radar-utils.test.ts
  └── activity-format.test.ts
```

#### [MODIFY] [package.json](file:///Users/xiaohongmao/HDU/MallocMentor/package.json)
新增 `"test": "vitest"`、`"test:run": "vitest run"`、`"test:ui": "vitest --ui"` 脚本，加 devDependency `vitest`。

#### 测试覆盖目标
不追求覆盖率数字，**先把 4 类高价值纯函数锁住行为**：
1. `achievements.ts` 的 `isConditionMet` / `getCandidateKeys`
2. `coze.ts` 的 `parseJsonAnswer`
3. `json-fields.ts` 全部
4. `sse.ts` 全部

**验证**：`pnpm test:run` 全绿。

---

## Verification Plan

### Automated Tests
- 阶段 1-4：`pnpm build` 必须通过（无 TS 错误，无 lint 错误）
- 阶段 5：`pnpm test:run` 全绿

### Manual Verification（每阶段都执行）

启动 `pnpm dev`，依次走查 6 个核心页面：

1. **登录** `/login` → 邮箱密码可登录
2. **Dashboard** `/dashboard` → 雷达图渲染、统计卡 4 张数字正确、最近活动列出
3. **Practice** `/practice` → 列表加载，进入题目 → 编辑代码 → 运行 + 提交，看到 AI 评审
4. **Learn** `/learn` → 当前路径显示进度、解锁路径可点开始
5. **Knowledge** `/knowledge` → 列表、分类筛选、收藏按钮、详情页可阅读、右下浮窗 AI 助手可对话
6. **Interview** `/interview` → 列表加载，新建会话，发消息看到流式回复
7. **Settings** `/settings` → 改昵称保存、上传头像、查看成就 Tab

**任一阶段挂掉 → `git revert` 该阶段 commit，定位问题再继续**。

---

## Test Safety Net

**当前覆盖**：0 单测。
**重构期间防线**：
- Git 分支隔离：`refactor/full-stack-cleanup` 分支推进，每阶段一个 commit，main 始终保持可用。
- 人工 7 步走查清单（见上）替代自动化测试。
- 阶段 5 之后才有真正的回归测试。

**如果毕设答辩临近**：可选择只做阶段 1+2+3，跳过阶段 4 的拆 page（视觉无变化，代码改动小）。

---

## Known Risks

1. **NextAuth 5 beta 升级风险** — 当前用 `5.0.0-beta.30`，迁移 `withAuth` 时如果 `auth()` 行为有边界场景未覆盖（如 OAuth 登录态），可能误返 401。**缓解**：阶段 2 完成后在 NextAuth 已配置的两种 provider 各登录一次。
2. **Prisma 7 generated 路径** — `src/generated/prisma` 是 gitignore 内的产物，重构期间如果有人 `pnpm db:push` 会重新生成，要确保 build 流程里 `prisma generate` 在前。
3. **SWR 缓存语义改变** — 当前用 `xxxApi` 直接调用没有缓存，改成 `useApi` 后 5 分钟内重复访问会读缓存。如果数据强一致需求强（如做完题后 dashboard 立刻看到统计变化），需要在 mutation 里 `mutate(SWR_KEYS.userStats)` 触发重新校验。**缓解**：在 `useApiMutation` 默认实现里支持 `invalidate: SWR_KEYS[]` 参数。
4. **拆 page 时漏迁状态** — 巨型 page 拆分时容易把某个 useState 留在父组件而消费它的 JSX 已经搬到子组件。**缓解**：拆完每个 page 立即走查该页所有交互。

---

## Next Step

→ 用户确认本计划 → 进入执行阶段，按 task.md 逐项推进
→ 计划保存路径 `.aone_copilot/plans/codebase-recon-refactor/`
→ Context Brief 同步保存到 `specs/context-brief.md`（执行第一步会创建）


updateAtTime: 2026/4/29 15:11:22

planId: d8c2b281-5a9c-4b4e-98c1-4455ab846877