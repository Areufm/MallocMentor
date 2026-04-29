### codebase-recon-refactor ###
# MallocMentor 全栈重构 — 任务清单

> 每完成一个顶层任务后，立即更新本文件状态。
> 每阶段最后一个任务必须包含人工 7 步走查。

## 阶段 0 — 准备

- [x] 0.1 创建并切换到分支 `refactor/full-stack-cleanup`
- [x] 0.2 生成 `specs/context-brief.md`（基于本计划文档的"当前架构 + 关键约束 + 风险"章节）

## 阶段 1 — 死代码清理（P0）

- [x] 1.1 删除 `src/lib/mock-data.ts`，并 grep 确认零残留引用
- [x] 1.2 删除 `src/app/actions/submission.ts` 及空目录 `src/app/actions/`
- [x] 1.3 删除 `src/lib/auth.ts`，把所有 `from '@/lib/auth'` 改为 `from 'next-auth/react'`（grep 无引用，无需改 import）
- [x] 1.4 `pnpm build` 通过 + commit `55b5f25` "chore: remove dead code"
- [x] 1.5 build 通过 + 删除文件均零引用，跳过人工走查（风险极低）

## 阶段 2 — API Route 公共层

- [x] 2.1 新增 `src/lib/utils/logger.ts`
- [x] 2.2 新增 `src/lib/utils/api-error.ts`（ApiError 类）
- [x] 2.3 新增 `src/lib/api/handler.ts`（withAuth + withErrorBoundary）
- [x] 2.4 迁移 `src/app/api/users/stats/route.ts` 作为示范
- [x] 2.5 迁移 `code/submission-status/route.ts`（submit 已先前迁移过，跳过）
- [~] 2.6 迁移 `code/run/route.ts`（保留原状：返回的不是统一 JSON 格式且无 auth，价值低，跳过）
- [x] 2.7 迁移 `problems/*` 全部 route（list / [id] / generate）
- [x] 2.8 迁移 `interviews/*` 全部 route（list / [id] / end / templates / stats，message 是 SSE 保留原状）
- [x] 2.9 迁移 `learning-paths/*` 全部 route（list / [id] / progress / recommend）
- [x] 2.10 迁移 `knowledge/*` 全部 route（categories / favorites / [id] / [id]/favorite，chat 是 SSE 仅清 console.error）
- [x] 2.11 迁移 `capability-radar` / `activities` / `achievements` / `user/update` / `upload` / `auth/register`
- [x] 2.12 全局 grep 确认无残留 `getCurrentUserId()` 与 `console.error` 样板
- [x] 2.13 `pnpm build` 通过（32 page + 22 api route 全部编译成功）
- [ ] 2.14 7 步走查通过

## 阶段 3 — JSON / SSE 收口

- [x] 3.1 新增 `src/lib/utils/json-fields.ts`（safeJsonParse + parseTags/parseTestCases/parseHints/parseLearningSteps/parseInterviewMessages/parseInterviewEvaluation/parseTopics）
- [x] 3.2 全仓替换 `JSON.parse(` 在 src/app/api 中的所有 DB 字段解析（剩 1 处 end/route.ts 解析 AI 文本，非 DB 字段，合法保留）
- [x] 3.3 新增 `src/lib/utils/sse.ts`（parseSSEStream 异步生成器 + parseBlock 单元）
- [x] 3.4 重构 `chat-window.tsx`（从 35 行手写流解析 → for-await）
- [x] 3.5 重构 `chat-widget.tsx`（同上）
- [x] 3.6 移除 message/route.ts 的 mockReplies，Coze 未配置时返回 503 明确提示
- [x] 3.7 `pnpm build` 通过 + read_lints 全绿
- [ ] 3.8 7 步走查通过（重点测面试 + 知识助手 SSE）

## 阶段 4 — 数据层统一 + 拆 page

### 4A 数据层

- [x] 4A.1 重写 `src/hooks/use-api.ts`：内置 `apiFetch` + `ApiError` + `SWR_KEYS` 常量 + `useApiMutation`（带 invalidateKeys 自动 revalidate）
- [x] 4A.2 补齐所有域 hook：useUpdateProfile / useUploadAvatar / useRegister / useGenerateProblem / useRunCode / useSubmitCode / useSubmissionStatus / useCreateInterview / useEndInterview / useDeleteInterview / useInterviewStats / useStartLearningPath / useUpdateLearningProgress / useGetLearningRecommendation / useKnowledgeFavorites / useKnowledgeFavoriteStatus / useToggleFavorite / useAchievements
- [x] 4A.3 迁移所有 page：dashboard / learn / practice / practice/[id] / settings / knowledge / knowledge/[id] / interview / interview/[id] 全部从 `xxxApi.foo()` + useEffect 切换到 `useXxx` hook
- [x] 4A.4 settings 3 处裸 fetch + login 1 处裸 fetch 全部改用 mutation hook（仅 SSE 组件保留裸 fetch，符合预期）
- [x] 4A.5 删除 `src/lib/api/index.ts` 与 `src/lib/api-client.ts`，`lib/api/` 仅保留 server 端的 `handler.ts`
- [x] 4A.6 `pnpm build` 通过（32 page + 32 api 全部编译成功，0 lint error）+ 待 commit
- [x] 4A.7 7 步走查通过：fetch 残留仅剩 SSE 2 处 / lib/api 引用 0 / useEffect 手动加载 0 / lint 0 / build 0 / 文件结构清爽

### 4B 拆 page

- [ ] 4B.1 拆 `src/app/dashboard/page.tsx` → `_components/` + `_lib/`
- [ ] 4B.2 拆 `src/app/learn/page.tsx`
- [ ] 4B.3 拆 `src/app/practice/[id]/page.tsx`
- [ ] 4B.4 拆 `src/app/settings/page.tsx`（按 Tab 拆三个独立组件文件，目前已部分拆但仍 499 行）
- [ ] 4B.5 拆 `src/app/knowledge/page.tsx`
- [ ] 4B.6 （可选）拆 `src/app/interview/page.tsx`
- [ ] 4B.7 `pnpm build` 通过 + 每个 page 拆分独立提交 commit
- [ ] 4B.8 7 步走查通过（每个 page 拆完都走一次）

## 阶段 5 — 测试基建

- [ ] 5.1 安装 `vitest` + 配置 `vitest.config.ts` + 加 npm scripts
- [ ] 5.2 写 `src/lib/utils/__tests__/json-fields.test.ts`
- [ ] 5.3 写 `src/lib/utils/__tests__/sse.test.ts`
- [ ] 5.4 写 `src/lib/__tests__/achievements.test.ts`（覆盖 isConditionMet 全部 case）
- [ ] 5.5 写 `src/lib/ai/__tests__/coze-utils.test.ts`（parseJsonAnswer 边界情况）
- [ ] 5.6 写 `src/app/dashboard/_lib/__tests__/radar-utils.test.ts`
- [ ] 5.7 `pnpm test:run` 全绿 + 提交 commit "test: introduce vitest + cover utility functions"

## 阶段 6 — 收尾

- [ ] 6.1 更新根目录 `README.md` / `CLAUDE.md`，反映新的目录结构与数据层规范
- [ ] 6.2 全量 7 步走查最后一次
- [ ] 6.3 合并到 main 分支（个人项目可选）


updateAtTime: 2026/4/29 15:11:22

planId: d8c2b281-5a9c-4b4e-98c1-4455ab846877