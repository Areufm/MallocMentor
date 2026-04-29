import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withErrorBoundary } from '@/lib/api/handler'
import { ApiError } from '@/lib/utils/api-error'

// GET /api/problems/[id] - 获取单个题目详情
export const GET = withErrorBoundary<{ id: string }>(async ({ params }) => {
  const { id } = params

  const problem = await prisma.problem.findUnique({ where: { id } })

  if (!problem) {
    throw new ApiError(404, '题目不存在')
  }

  const parsed = {
    ...problem,
    tags: JSON.parse(problem.tags),
    testCases: JSON.parse(problem.testCases),
    hints: problem.hints ? JSON.parse(problem.hints) : [],
  }

  return NextResponse.json(createSuccessResponse(parsed))
})
