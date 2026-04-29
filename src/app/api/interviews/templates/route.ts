import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withErrorBoundary } from '@/lib/api/handler'

// GET /api/interviews/templates - 获取面试模板列表
export const GET = withErrorBoundary(async () => {
  const templates = await prisma.interviewTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  })

  const parsed = templates.map(t => ({
    ...t,
    topics: JSON.parse(t.topics),
  }))

  return NextResponse.json(createSuccessResponse(parsed))
})
