import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth } from '@/lib/api/handler'
import { ApiError } from '@/lib/utils/api-error'
import { parseInterviewMessages, parseInterviewEvaluation } from '@/lib/utils/json-fields'

// GET /api/interviews/[id] - 获取面试会话详情
export const GET = withAuth<{ id: string }>(async ({ userId, params }) => {
  const { id } = params

  const session = await prisma.interviewSession.findFirst({
    where: { id, userId },
  })

  if (!session) {
    throw new ApiError(404, '面试会话不存在')
  }

  return NextResponse.json(createSuccessResponse({
    ...session,
    messages: parseInterviewMessages(session.messages),
    evaluation: parseInterviewEvaluation(session.evaluation) ?? undefined,
  }))
})

// DELETE /api/interviews/[id] - 删除面试会话
export const DELETE = withAuth<{ id: string }>(async ({ userId, params }) => {
  const { id } = params
  await prisma.interviewSession.deleteMany({ where: { id, userId } })
  return NextResponse.json(createSuccessResponse({ id }, '删除成功'))
})
