import { NextRequest, NextResponse } from 'next/server'
import { mockInterviewSessions, createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'
import type { CreateInterviewRequest, InterviewSession } from '@/types/api'

// GET /api/interviews - 获取面试会话列表
export async function GET(request: NextRequest) {
  try {
    await delay(300)

    return NextResponse.json(createSuccessResponse(mockInterviewSessions))
  } catch (error) {
    console.error('Get interviews error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}

// POST /api/interviews - 创建新的面试会话
export async function POST(request: NextRequest) {
  try {
    await delay(500)

    const body: CreateInterviewRequest = await request.json()
    const { title, type, templateId } = body

    if (!title || !type) {
      return NextResponse.json(
        createErrorResponse('缺少必要参数'),
        { status: 400 }
      )
    }

    const newSession: InterviewSession = {
      id: `interview_${Date.now()}`,
      userId: '1',
      title,
      type,
      status: 'active',
      templateId,
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: '你好！我是你的 AI 面试官。今天我们将进行一场技术面试。准备好了吗？',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(createSuccessResponse(newSession, '面试会话创建成功'))
  } catch (error) {
    console.error('Create interview error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
