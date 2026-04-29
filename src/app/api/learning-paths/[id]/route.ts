import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth } from '@/lib/api/handler'
import { ApiError } from '@/lib/utils/api-error'

// GET /api/learning-paths/[id] - 获取学习路径详情
export const GET = withAuth<{ id: string }>(async ({ userId, params }) => {
  const { id } = params

  const path = await prisma.learningPath.findFirst({ where: { id, userId } })

  if (!path) {
    throw new ApiError(404, '学习路径不存在')
  }

  return NextResponse.json(createSuccessResponse({
    ...path,
    steps: JSON.parse(path.steps),
  }))
})
