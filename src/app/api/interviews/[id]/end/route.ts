import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/utils/response'
import { withAuth } from '@/lib/api/handler'
import { ApiError } from '@/lib/utils/api-error'
import { logger } from '@/lib/utils/logger'
import { chatNonStream, isCozeConfigured } from '@/lib/ai/coze'
import { checkAndAwardAchievements } from '@/lib/achievements'

// POST /api/interviews/[id]/end - 结束面试并生成 AI 评估
export const POST = withAuth<{ id: string }>(async ({ userId, params }) => {
  const { id } = params

  const session = await prisma.interviewSession.findFirst({
    where: { id, userId },
  })

  if (!session) {
    throw new ApiError(404, '面试会话不存在')
  }

  if (session.status === 'completed') {
    return NextResponse.json(createSuccessResponse({
      ...session,
      messages: JSON.parse(session.messages),
      evaluation: session.evaluation ? JSON.parse(session.evaluation) : null,
    }, '面试已经结束'))
  }

  const messages = JSON.parse(session.messages)

  let evaluation = {
    overallScore: 75,
    communication: 78,
    technicalDepth: 72,
    problemSolving: 75,
    feedback: '面试已完成，感谢你的参与！',
    strengths: ['积极参与面试'],
    improvements: ['继续加强技术深度'],
  }

  // 通过 Coze 生成评估
  if (isCozeConfigured('interview') && messages.length > 2) {
    const dialogSummary = messages
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? '候选人' : '面试官'}：${m.content}`)
      .join('\n')

    const evalPrompt = `以下是一段 C/C++ 技术面试对话记录，请你作为资深面试官对候选人的表现进行评估。

对话记录：
${dialogSummary}

请严格按照以下 JSON 格式返回评估结果（不要包含其他内容）：
{
  "overallScore": 0-100的整数,
  "communication": 0-100的整数,
  "technicalDepth": 0-100的整数,
  "problemSolving": 0-100的整数,
  "feedback": "一段总结性评语",
  "strengths": ["优点1", "优点2"],
  "improvements": ["改进建议1", "改进建议2"]
}`

    try {
      const { answer: reply } = await chatNonStream('interview', evalPrompt)
      const jsonMatch = reply.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.overallScore !== undefined) {
          evaluation = parsed
        }
      }
    } catch (e) {
      logger.error('interviews/end', 'AI evaluation generation failed', e)
    }
  }

  // 更新会话状态
  await prisma.interviewSession.update({
    where: { id },
    data: {
      status: 'completed',
      evaluation: JSON.stringify(evaluation),
    },
  })

  // 写入活动日志
  await prisma.activityLog.create({
    data: {
      userId,
      type: 'interview',
      title: `完成了模拟面试「${session.title}」`,
      description: `综合评分：${evaluation.overallScore}分`,
      metadata: JSON.stringify({ sessionId: id, score: evaluation.overallScore }),
    },
  })

  // 检测成就
  await checkAndAwardAchievements(userId, { type: 'interview_end' })

  return NextResponse.json(createSuccessResponse({
    id: session.id,
    status: 'completed',
    evaluation,
  }, '面试已结束，评估报告已生成'))
})
