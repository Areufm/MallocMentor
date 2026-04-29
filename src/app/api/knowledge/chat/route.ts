import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse } from '@/lib/utils/response'
import { logger } from '@/lib/utils/logger'
import { chatStream, isCozeConfigured } from '@/lib/ai/coze'

/**
 * POST /api/knowledge/chat
 *
 * 知识助手流式对话接口，返回 SSE 流。
 * 前端通过 sessionId 维持多轮对话上下文。
 *
 * 注意：此路由返回的是 SSE，不能用 withErrorBoundary 包装（会被强制成 JSON 响应）。
 */
export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(createErrorResponse('消息内容不能为空'), { status: 400 })
    }

    if (!isCozeConfigured('knowledge')) {
      return NextResponse.json(createErrorResponse('知识助手未配置'), { status: 503 })
    }

    const { stream: textStream, sessionId: newSessionId } =
      await chatStream('knowledge', message, sessionId || undefined)

    const encoder = new TextEncoder()
    const sseStream = new ReadableStream({
      async start(controller) {
        // 先推送 sessionId 供前端保存
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'session', sessionId: newSessionId })}\n\n`)
        )

        const reader = textStream.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(value)}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: String(err) })}\n\n`)
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
    logger.error('knowledge/chat', 'failed', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
