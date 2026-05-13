import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withErrorBoundary } from '@/lib/api/handler'
import { parseTopics } from '@/lib/utils/json-fields'

// GET /api/interviews/templates - 获取面试模板列表
export const GET = withErrorBoundary(async () => {
  const templates = await prisma.interviewTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  })

  const parsed = templates.map(t => ({
    ...t,
    topics: parseTopics(t.topics),
  }))

  return NextResponse.json(createSuccessResponse(parsed))
})
