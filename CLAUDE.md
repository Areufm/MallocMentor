# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MallocMentor** is a C/C++ intelligent tutoring platform built with Next.js, providing an all-in-one solution for computer science students from basic learning to technical interview preparation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| Database | PostgreSQL (Neon-compatible) |
| ORM | Prisma 7 (output → `src/generated/prisma`) |
| Auth | NextAuth.js 5 (beta) — Credentials + GitHub OAuth |
| Code Editor | Monaco Editor |
| Data Fetching | SWR (single source of truth via `src/hooks/use-api.ts`) |
| Charts | Recharts |
| Markdown | react-markdown + remark-gfm + rehype-highlight |
| AI | Coze (4 bots: interview / codeReview / knowledge / learningPath) |
| Sandbox | Piston / Judge0 (configurable) |

## Essential Commands

```bash
# Development
pnpm dev                    # Start dev server (http://localhost:3000)

# Build
pnpm build                  # Generate Prisma client + production build
pnpm start                  # Start production server

# Database
pnpm db:push               # Sync Prisma schema to database
pnpm db:seed               # Seed database with initial data
pnpm db:sync-articles      # Sync markdown articles to database (scripts/sync-articles.ts)

# Prisma (direct)
npx prisma generate        # Generate Prisma client → src/generated/prisma
npx prisma studio          # Open Prisma Studio for DB inspection
```

## Architecture

### Directory Structure

```
src/
├── app/                      # Next.js App Router routes & API routes
│   ├── api/                  # Route handlers (all wrapped via withAuth/withErrorBoundary)
│   │   ├── auth/             # NextAuth + register endpoint
│   │   ├── code/             # Code execution & submission
│   │   ├── interviews/       # Interview session management (incl. SSE message stream)
│   │   ├── knowledge/        # Knowledge base + favorites + chat (SSE)
│   │   ├── learning-paths/   # Learning path CRUD + AI recommendation
│   │   ├── problems/         # Problem management + AI generation
│   │   ├── upload/           # Avatar upload
│   │   └── user/             # User profile updates
│   ├── dashboard/            # Overview with radar charts
│   ├── interview/            # AI interview sessions
│   ├── knowledge/            # Knowledge article browsing
│   ├── learn/                # Learning path navigation
│   ├── login/                # Authentication
│   ├── practice/             # Code practice with Monaco editor
│   └── settings/             # User settings (profile / security / achievements)
│
│   Convention for non-trivial pages:
│     <route>/page.tsx         — hook calls + state orchestration only (~80–170 lines)
│     <route>/_components/*.tsx — presentational components (extracted from the page)
│     <route>/_lib/*.ts        — pure functions, types, constants for this route
│
├── components/
│   ├── code-editor/          # Monaco editor wrapper
│   ├── interview/            # Interview chat UI (chat-window consumes parseSSEStream)
│   ├── knowledge-assistant/  # Knowledge base chat widget (also SSE)
│   ├── layout/               # App shell (header, sidebar, theme toggle)
│   ├── providers/            # SessionProvider / SWRProvider
│   └── ui/                   # shadcn/ui primitives
├── hooks/
│   └── use-api.ts            # SWR-based hook layer (apiFetch + ApiError + 25+ domain hooks)
├── lib/
│   ├── achievements.ts       # Achievement tracking logic
│   ├── ai/coze.ts            # Coze AI client (4 bots)
│   ├── api/
│   │   └── handler.ts        # withAuth / withErrorBoundary HOFs (auto await params,
│   │                         #   auth check, error → JSON, structured logs)
│   ├── learning-path-templates.ts
│   ├── prisma.ts             # Prisma client singleton
│   ├── sandbox.ts            # Code execution sandbox (Piston / Judge0)
│   └── utils/
│       ├── api-error.ts      # ApiError class (status + message)
│       ├── json-fields.ts    # safeJsonParse + parseTags / parseTestCases / parseHints /
│       │                     #   parseLearningSteps / parseInterviewMessages / parseTopics
│       ├── logger.ts         # Scoped logger (debug/info/warn/error)
│       ├── response.ts       # Response helpers
│       └── sse.ts            # parseSSEStream async generator (typed SSE events)
├── types/
│   └── api.ts                # API type definitions
├── auth.config.ts            # NextAuth configuration
├── auth.ts                   # Auth helpers
└── middleware.ts             # NextAuth session middleware
```

### Key Patterns

- **API Route Boundary** — Every route handler is wrapped via `withAuth` or `withErrorBoundary`
  from `src/lib/api/handler.ts`. The wrapper:
    - awaits Next.js 16 dynamic `params`,
    - performs the session check (for `withAuth`),
    - catches thrown `ApiError`/unknown errors and returns a uniform JSON shape,
    - logs every failure via the scoped logger.
  Handlers themselves only contain business logic — no try/catch boilerplate, no manual
  `await params`, no hand-rolled 401 responses.

- **Data Fetching** — `src/hooks/use-api.ts` is the **single client-side data layer**.
  It owns `apiFetch` + `ApiError` and exposes 25+ domain hooks (`useUserStats`,
  `useProblems`, `useInterview`, `useKnowledgeArticles`, …). All mutations go through
  `useApiMutation` which automatically `mutate()`s relevant SWR keys via
  `invalidateKeys`, so list views refresh after writes without manual plumbing.
  **Never** call `fetch` directly from a component; **never** reintroduce `lib/api-client.ts`.

- **JSON / SSE Decoding** — All Prisma JSON columns are decoded through helpers in
  `src/lib/utils/json-fields.ts` (so we don't `JSON.parse` ad-hoc). All SSE consumers
  (interview chat, knowledge assistant) iterate over `parseSSEStream(response.body)`
  from `src/lib/utils/sse.ts` instead of hand-parsing `data:` lines.

- **Page Composition** — Non-trivial pages follow the `_components` + `_lib` convention
  described above. The `page.tsx` itself stays small enough to scan in one screen.
  Pure functions (e.g. `toRadarData`, `parseReviewJson`, `extractStdinFromTestCase`,
  `calcOverallProgress`) live in `_lib/` and are dependency-free + trivially testable.

- **Authentication** — NextAuth.js 5 (beta) with Credentials + GitHub. Session managed
  via `src/components/providers/session-provider.tsx`. Protected routes via
  `src/middleware.ts`. Inside route handlers, `withAuth` injects the resolved `userId`
  into the handler context.

- **Database** — Prisma client generated to `src/generated/prisma` (custom output
  path). Single client instance exported from `src/lib/prisma.ts`.

- **AI Integration** — Coze AI powers interview, code review, knowledge assistant and
  learning recommendations. Client in `src/lib/ai/coze.ts`. Streaming responses are
  emitted as SSE and consumed via `parseSSEStream`.

- **Content** — Knowledge articles are markdown files in `content/articles/` synced to
  the database via `scripts/sync-articles.ts`. Frontmatter parsed with `gray-matter`.

- **Code Execution** — Submissions go through `src/app/api/code/run/route.ts` →
  `src/lib/sandbox.ts` for isolated C/C++ compilation against Piston or Judge0.

- **Styling** — Tailwind CSS 4 with `@tailwindcss/typography`. Dark mode via
  `next-themes`. Component variants via `class-variance-authority`.

- **React Compiler** — Enabled in `next.config.ts` for automatic memoization.

### Anti-Patterns (do not reintroduce)

The following modules were intentionally removed during the 2026-Q2 refactor and
should **not** come back:
- `src/lib/mock-data.ts` — 543 lines of unused mock fixtures.
- `src/lib/api-client.ts` and `src/lib/api/index.ts` — replaced by `useApiMutation`
  and the domain hooks in `src/hooks/use-api.ts`.
- `src/lib/auth.ts` re-export shim — import directly from `src/auth.ts`.
- Hand-rolled `try/catch` + `await params` + `getServerSession` in every route handler
  — use `withAuth` / `withErrorBoundary` instead.
- Hand-rolled SSE `data:` line parsing in components — use `parseSSEStream`.
- Ad-hoc `JSON.parse` of Prisma JSON columns — use `parseTags` / `parseTestCases` /
  `parseInterviewMessages` / etc. from `json-fields.ts`.

### Database Models

Core models defined in `prisma/schema.prisma`:
- **User** - with NextAuth accounts/sessions
- **CapabilityRadar** - 6-dimension skill assessment (0-100 each)
- **Problem** - coding problems with test cases
- **CodeSubmission** - code submissions with AI review field
- **InterviewSession** - AI interview conversations (JSON messages)
- **LearningPath** - structured learning paths (JSON steps)
- **KnowledgeArticle** - content synced from markdown files
- **UserLearningProgress** - per-user article reading progress
- **UserFavorite** - article bookmarks
- **InterviewTemplate** - predefined interview configurations
- **UserAchievement** - unlocked achievements
- **ActivityLog** - user activity tracking
