import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth } from '@/lib/api/handler'
import { ApiError } from '@/lib/utils/api-error'
import type { CreateInterviewRequest } from '@/types/api'

// GET /api/interviews - 获取面试会话列表
export const GET = withAuth(async ({ userId }) => {
  const sessions = await prisma.interviewSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  const parsed = sessions.map(s => ({
    ...s,
    messages: JSON.parse(s.messages),
    evaluation: s.evaluation ? JSON.parse(s.evaluation) : undefined,
  }))

  return NextResponse.json(createSuccessResponse(parsed))
})

// POST /api/interviews - 创建新的面试会话
export const POST = withAuth(async ({ userId, req }) => {
  const body: CreateInterviewRequest = await req.json()
  const { title, type, templateId } = body

  if (!title || !type) {
    throw new ApiError(400, '缺少必要参数')
  }

  const initialMessages = [
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是你的 AI 面试官。今天我们将进行一场技术面试。准备好了吗？',
      timestamp: new Date().toISOString(),
    },
  ]

  const session = await prisma.interviewSession.create({
    data: {
      userId,
      title,
      type,
      status: 'active',
      templateId: templateId || null,
      messages: JSON.stringify(initialMessages),
    },
  })

  return NextResponse.json(createSuccessResponse({
    ...session,
    messages: initialMessages,
  }, '面试会话创建成功'))
})
