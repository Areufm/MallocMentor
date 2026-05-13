import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withErrorBoundary } from '@/lib/api/handler'
import { ApiError } from '@/lib/utils/api-error'
import { parseTags, parseTestCases, parseHints } from '@/lib/utils/json-fields'

// GET /api/problems/[id] - 获取单个题目详情
export const GET = withErrorBoundary<{ id: string }>(async ({ params }) => {
  const { id } = params

  const problem = await prisma.problem.findUnique({ where: { id } })

  if (!problem) {
    throw new ApiError(404, '题目不存在')
  }

  const parsed = {
    ...problem,
    tags: parseTags(problem.tags),
    testCases: parseTestCases(problem.testCases),
    hints: parseHints(problem.hints),
  }

  return NextResponse.json(createSuccessResponse(parsed))
})
