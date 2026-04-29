# Context Brief: MallocMentor 全栈重构

> 由 `aca-codebase-recon` 在 2026-04-29 生成。详细的可执行 Plan 见 `.aone_copilot/plans/codebase-recon-refactor/`。

## System Overview

**MallocMentor** 是一个面向 C/C++ 学习者的智能辅导平台（个人毕设项目）。核心能力：题目练习 + AI 代码审查 + AI 模拟面试 + 知识库 + 学习路径推荐 + 能力雷达图。下游对接 Coze 应用（4 个 Bot：interview / codeReview / knowledge / learningPath）和代码沙盒（Piston 默认，可切 Judge0）。

技术栈：Next.js 16 (App Router) + React 19 + Prisma 7 + PostgreSQL + NextAuth 5 (beta JWT + Credentials) + SWR + Recharts + Monaco Editor。

## Architecture (Current State)

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
      ┌─────────┐    ┌──────────────┐  ┌──────────┐
      │ Prisma  │    │ Coze SSE     │  │ Sandbox  │
      │singleton│    │(lib/ai/coze) │  │ (Piston) │
      └─────────┘    └──────────────┘  └──────────┘
```

**架构模式一致性：MEDIUM** — 数据获取有 3 套方案并存（SWR Hook / xxxApi+useState / 裸 fetch）。

## Key Constraints

- **个人毕设项目**：无真实用户，可激进重构；但毕设答辩前不能跑挂。
- **Demo 路径锁定**：dashboard、practice、interview、learn、knowledge、settings 6 个页面是核心 demo 路径，每阶段重构后必须人工 7 步走查。
- **AI 服务降级路径不能丢**：Coze 未配置时需要明确"未配置提示"（不能崩），但写死的 5 条 mockReplies 应当移除。
- **测试空白**：当前 0 单测。重构必须为抽取的纯函数补单测作为防线。
- **数据库 schema 不动**：本次重构不改 Prisma schema，避免 db migration 风险。
- **Prisma 7 generated 路径特殊**：客户端生成到 `src/generated/prisma`（非默认位置），build 流程必须先 `prisma generate`。

## Change Target

**重构范围**：全栈大整治 — 前端 + 后端 + 死代码清理 + 测试体系，分阶段推进。

**Blast Radius**：
- 数据层重构 → 影响所有 6 核心页面 + 2 个 chat 组件
- API 中间件抽取 → 影响 21 个 route 文件
- 巨型 page 拆分 → 影响 5 个超 400 行 page

**Fragility 评分**：

| 维度 | 评分 | 说明 |
|---|---|---|
| 测试覆盖 | □□□□□ 0/5 | 全仓库零单测 |
| 文档 | ■■■□□ 3/5 | 有 CLAUDE.md / README，API 注释中等 |
| 耦合 | ■■■■□ 4/5 | 数据获取 3 套并存，page 与 api/index 紧耦合 |
| 修改频率 | ■■■□□ 3/5 | api/index.ts 8 次、dashboard 7 次（高频痛点） |
| 代码清晰度 | ■■■□□ 3/5 | 命名 OK，但 page 巨型 + 强转 `as unknown as` 多 |

**整体脆弱度：MEDIUM-HIGH**。激进重构可行，但必须配合 Git 分支隔离 + 每阶段独立 commit。

## Dependencies

**Inbound（上游消费方）**：
- 浏览器（用户）
- 暂无外部系统集成

**Outbound（下游依赖）**：
- PostgreSQL（Prisma 7 + adapter-pg）
- Coze 应用 API（4 个独立 Bot，每个独立环境变量）
- Piston / Judge0 代码沙盒（外网公共 API）
- 阿里 OSS 或本地 fs（头像上传，由 `/api/upload` 决定）

**External 风险点**：Coze 与 Piston 都是外部 SaaS，超时/限流可能影响 demo。

## Recommended Strategy

**Surgical Strike + Branch by Abstraction + Strangler Fig 三策略组合**：

1. 死代码删除 → **Surgical Strike**（小、可逆、瞬间见效）
2. `withAuth` 中间件 → **Branch by Abstraction**（先建抽象层，再逐文件迁移，新旧并存期短）
3. 巨型 page 拆分 → **Strangler Fig**（新组件并行创建，逐块替换 JSX，最后清空 page 文件）

**回滚策略**：每阶段一个 git commit。任一阶段挂掉 → `git revert` 该阶段 commit，定位问题再继续。

## Test Safety Net

**当前覆盖**：0 单测。

**重构期间防线**：
- Git 分支隔离：`refactor/full-stack-cleanup` 分支推进，main 始终保持可用
- 每阶段独立 commit，可单独 revert
- 人工 7 步走查清单（登录 → dashboard → practice → learn → knowledge → interview → settings）
- 阶段 5 才有真正的回归测试（vitest 覆盖纯函数）

**关键纯函数补测目标**（阶段 5）：
1. `lib/achievements.ts` 的条件判定逻辑
2. `lib/ai/coze.ts` 的 `parseJsonAnswer`
3. 新增 `lib/utils/json-fields.ts` 全部
4. 新增 `lib/utils/sse.ts` 全部
5. dashboard 拆出的 `radar-utils` / `activity-format`

## Known Risks

1. **NextAuth 5 beta 升级风险**：当前 `5.0.0-beta.30`，封装 `withAuth` 时如果 `auth()` 在某些边界场景行为非预期可能误返 401。**缓解**：阶段 2 完成后实测登录态 + 未登录态。
2. **Prisma 7 generated 路径**：`src/generated/prisma` 是 gitignored 产物，重构期间任何 `pnpm db:push` 会重新生成。**缓解**：build script 已包含 `prisma generate`。
3. **SWR 缓存语义改变**：`xxxApi` 直接调用无缓存，改为 `useApi` 后 5 分钟内重复访问读缓存。如做完题后 dashboard 立刻看统计变化，需要 `mutate(SWR_KEYS.userStats)` 触发 revalidate。**缓解**：在 `useApiMutation` 实现里支持 `invalidate: SWR_KEYS[]` 参数。
4. **拆 page 漏迁状态**：巨型 page 拆分容易把 useState 留在父组件而消费 JSX 已搬到子组件。**缓解**：每拆完一个 page 立即手动走查所有交互。
5. **SSE 不能被 wrapper JSON 化**：阶段 2 抽 `withAuth` 时，`/api/interviews/[id]/message` 和 `/api/knowledge/chat` 是 SSE 路由，wrapper 必须只接管认证和异常，不能把 SSE Response 二次包装。**缓解**：在 wrapper 里检测返回是否为 `Response` 实例直接 passthrough。

## Top 12 异味（优先级排序）

| # | 问题 | 文件证据 | 优先级 |
|---|------|---------|--------|
| 1 | mock-data.ts 543 行死代码（零引用） | `src/lib/mock-data.ts` | P0 |
| 2 | actions/submission.ts 已 deprecated 仅注释 | `src/app/actions/submission.ts` | P0 |
| 3 | lib/auth.ts 仅一行 re-export 无价值间接层 | `src/lib/auth.ts` | P0 |
| 4 | createSuccessResponse 在两处双重定义 | mock-data + utils/response | P0 |
| 5 | 21 个 route 重复 auth/try-catch/error 模板 | `src/app/api/**/route.ts` | P1 |
| 6 | JSON 字段散落手写 JSON.parse | tags/steps/messages 多处 | P1 |
| 7 | SSE 解析逻辑前后端各写一份 | chat-window/chat-widget/coze.ts | P1 |
| 8 | 数据获取三套并行，SWR 几乎没用 | api-client + api/index + use-api + 裸 fetch | P1 |
| 9 | 巨型 page（learn 617 / practice 519 / dashboard 500 / settings 499 / knowledge 477） | `src/app/**/page.tsx` | P2 |
| 10 | 业务派生函数挂在 page 顶层 | dashboard 多个 toXxx 函数 | P2 |
| 11 | 硬编码 mockReplies 留在 prod 路径 | `interviews/[id]/message/route.ts` | P2 |
| 12 | 0 测试覆盖 | 全仓库 | P3 |

## Next Step

→ 已生成 Plan：`.aone_copilot/plans/codebase-recon-refactor/`
→ 用户已确认执行 → 按 task.md 阶段 1-6 逐项推进
