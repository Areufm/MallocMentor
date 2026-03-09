import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, getCurrentUserId } from '@/lib/utils/response'
import type { CreateInterviewRequest } from '@/types/api'

// GET /api/interviews - 获取面试会话列表
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
    }

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
  } catch (error) {
    console.error('Get interviews error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}

// POST /api/interviews - 创建新的面试会话
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
    }

    const body: CreateInterviewRequest = await request.json()
    const { title, type, templateId } = body

    if (!title || !type) {
      return NextResponse.json(createErrorResponse('缺少必要参数'), { status: 400 })
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
  } catch (error) {
    console.error('Create interview error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
