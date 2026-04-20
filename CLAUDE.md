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
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Auth | NextAuth.js 5 (beta) |
| Code Editor | Monaco Editor |
| Data Fetching | SWR |
| Charts | Recharts |
| Markdown | react-markdown + remark-gfm + rehype-highlight |

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
│   ├── api/                  # Route handlers (REST API)
│   │   ├── auth/             # NextAuth + register endpoint
│   │   ├── code/             # Code execution & submission
│   │   ├── interviews/       # Interview session management
│   │   ├── knowledge/        # Knowledge base + favorites + chat
│   │   ├── learning-paths/   # Learning path CRUD
│   │   ├── problems/         # Problem management + AI generation
│   │   └── user/             # User profile updates
│   ├── dashboard/            # Overview with radar charts
│   ├── interview/            # AI interview sessions
│   ├── knowledge/            # Knowledge article browsing
│   ├── learn/                # Learning path navigation
│   ├── login/                # Authentication
│   ├── practice/             # Code practice with Monaco editor
│   └── settings/             # User settings
├── components/
│   ├── code-editor/          # Monaco editor wrapper
│   ├── interview/            # Interview chat UI
│   ├── knowledge-assistant/  # Knowledge base chat widget
│   ├── layout/               # App shell (header, sidebar, theme toggle)
│   └── ui/                   # shadcn/ui primitives
├── hooks/
│   └── use-api.ts            # API hook wrapper (uses SWR)
├── lib/
│   ├── achievements.ts       # Achievement tracking logic
│   ├── ai/coze.ts            # Coze AI integration
│   ├── api-client.ts         # HTTP client utilities
│   ├── api/index.ts          # API module aggregator
│   ├── auth.ts               # Auth utilities
│   ├── learning-path-templates.ts  # Path templates
│   ├── mock-data.ts          # Development mock data
│   ├── prisma.ts             # Prisma client singleton
│   ├── sandbox.ts            # Code execution sandbox
│   └── utils/                # General utilities
├── types/
│   └── api.ts                # API type definitions
├── auth.config.ts            # NextAuth configuration
├── auth.ts                   # Auth helpers
└── middleware.ts             # NextAuth session middleware
```

### Key Patterns

- **API Layer**: Route handlers in `src/app/api/*/route.ts` use direct Prisma queries. Response utilities in `src/lib/utils/response.ts`.
- **Data Fetching**: SWR is used via `src/hooks/use-api.ts` for client-side data fetching with caching.
- **Authentication**: NextAuth.js 5 (beta) with credentials + OAuth providers. Session state managed via `src/components/providers/session-provider.tsx`. Protected routes via `src/middleware.ts`.
- **Database**: Prisma client is generated to `src/generated/prisma` (custom output path). Single client instance exported from `src/lib/prisma.ts`.
- **AI Integration**: Coze AI powers the interview chat and knowledge assistant. Client in `src/lib/ai/coze.ts`.
- **Content**: Knowledge articles are markdown files in `content/articles/` synced to the database via `scripts/sync-articles.ts`. Frontmatter parsed with `gray-matter`.
- **Code Execution**: Submissions go through `src/app/api/code/run/route.ts` → `src/lib/sandbox.ts` for isolated C/C++ compilation and testing.
- **Styling**: Tailwind CSS 4 with `@tailwindcss/typography` plugin. Dark mode via `next-themes`. Component variants via `class-variance-authority`.
- **React Compiler**: Enabled in `next.config.ts` for automatic memoization optimization.

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
