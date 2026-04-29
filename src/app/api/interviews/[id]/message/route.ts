import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { createErrorResponse } from '@/lib/utils/response'
import { logger } from '@/lib/utils/logger'
import { parseInterviewMessages } from '@/lib/utils/json-fields'
import { chatStream, isCozeConfigured } from '@/lib/ai/coze'
import type { SendMessageRequest, InterviewMessage } from '@/types/api'

/**
 * POST /api/interviews/[id]/message
 *
 * 流式 SSE 接口（始终返回 text/event-stream，不能用 withAuth wrapper 包成 JSON）。
 *
 * 行为：
 * - Coze 已配置：调用 Coze interview Bot，流式回复并持久化完整回复
 * - Coze 未配置：返回明确的 503 提示（不再使用硬编码 mock 回复，避免误导用户）
 *
 * 消息持久化：每次交互后将用户消息和 AI 回复追加到 InterviewSession.messages
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
    }

    const body: SendMessageRequest = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json(createErrorResponse('消息内容不能为空'), { status: 400 })
    }

    // 获取当前会话用于持久化
    const interviewSession = await prisma.interviewSession.findFirst({
      where: { id, userId },
    })
    if (!interviewSession) {
      return NextResponse.json(createErrorResponse('面试会话不存在'), { status: 404 })
    }

    if (!isCozeConfigured('interview')) {
      return NextResponse.json(
        createErrorResponse('AI 面试官未配置，请在 .env 配置 Coze Interview Bot 的 token 与 botId'),
        { status: 503 },
      )
    }

    // 追加用户消息并持久化
    const existingMessages: InterviewMessage[] = parseInterviewMessages(interviewSession.messages)
    const userMsg: InterviewMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }
    existingMessages.push(userMsg)

    await prisma.interviewSession.update({
      where: { id },
      data: { messages: JSON.stringify(existingMessages) },
    })

    // ---- Coze 流式模式 ----
    const cozeSessionId =
      interviewSession.cozeSessionId || request.headers.get('x-session-id') || undefined

    const { stream: textStream, sessionId: newSessionId } = await chatStream(
      'interview',
      message,
      cozeSessionId,
    )

    // 保存 cozeSessionId 用于多轮对话
    if (newSessionId && newSessionId !== interviewSession.cozeSessionId) {
      await prisma.interviewSession.update({
        where: { id },
        data: { cozeSessionId: newSessionId },
      })
    }

    // 收集完整回复用于持久化
    let fullResponse = ''

    const encoder = new TextEncoder()
    const sseStream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'session', sessionId: newSessionId })}\n\n`,
          ),
        )

        const reader = textStream.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            if (typeof value === 'string') fullResponse += value
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(value)}\n\n`))
          }

          // 持久化 AI 回复
          if (fullResponse) {
            const aiMsg: InterviewMessage = {
              id: `msg_${Date.now()}`,
              role: 'assistant',
              content: fullResponse,
              timestamp: new Date().toISOString(),
            }
            existingMessages.push(aiMsg)
            await prisma.interviewSession.update({
              where: { id },
              data: { messages: JSON.stringify(existingMessages) },
            })
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: String(err) })}\n\n`),
          )
          controller.close()
        }
      },
    })

    return new Response(sseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    logger.error('interviews/message', 'failed', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}

