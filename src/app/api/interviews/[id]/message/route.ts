import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse, delay } from '@/lib/mock-data'
import type { SendMessageRequest, InterviewMessage } from '@/types/api'

// POST /api/interviews/[id]/message - 发送消息
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await delay(1500) // 模拟 AI 思考时间

    const body: SendMessageRequest = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json(
        createErrorResponse('消息内容不能为空'),
        { status: 400 }
      )
    }

    // Mock AI 回复
    const aiResponse: InterviewMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: '很好的回答！让我们深入一下。你能解释一下智能指针的实现原理吗？特别是 shared_ptr 的引用计数机制？',
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(createSuccessResponse(aiResponse))
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      createErrorResponse('服务器错误'),
      { status: 500 }
    )
  }
}
