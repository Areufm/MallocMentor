import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, getCurrentUserId } from '@/lib/utils/response'
import { chatNonStream, isCozeConfigured } from '@/lib/ai/coze'
import type { SubmitCodeRequest } from '@/types/api'

// POST /api/code/submit - 提交代码（通过 Coze 代码审查 Bot 审查）
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json(createErrorResponse('未登录'), { status: 401 })
    }

    const body: SubmitCodeRequest = await request.json()
    const { problemId, code, language } = body

    if (!problemId || !code || !language) {
      return NextResponse.json(createErrorResponse('缺少必要参数'), { status: 400 })
    }

    // 获取题目信息
    const problem = await prisma.problem.findUnique({ where: { id: problemId } })
    if (!problem) {
      return NextResponse.json(createErrorResponse('题目不存在'), { status: 404 })
    }

    let aiReviewText = ''
    let status = 'Passed'

    if (isCozeConfigured('codeReview')) {
      const prompt = `请审查以下 ${language === 'cpp' ? 'C++' : 'C'} 代码（题目：${problem.title}）：\n\n题目描述：${problem.description}\n\n代码：\n\`\`\`${language}\n${code}\n\`\`\`\n\n请给出代码审查意见，包括：正确性评估、代码质量、优化建议。`

      try {
        const { answer } = await chatNonStream('codeReview', prompt)
        aiReviewText = answer
      } catch {
        aiReviewText = '代码审查服务暂时不可用'
      }
    } else {
      aiReviewText = '代码审查 Bot 未配置。请在扣子平台创建代码审查 Bot 并配置环境变量。'
    }

    // 保存提交记录
    const submission = await prisma.codeSubmission.create({
      data: {
        userId,
        problemId,
        code,
        language,
        status,
        aiReview: aiReviewText,
      },
    })

    // 写入活动日志
    await prisma.activityLog.create({
      data: {
        userId,
        type: 'practice',
        title: `提交了练习题「${problem.title}」`,
        description: `状态：${status}`,
        metadata: JSON.stringify({ submissionId: submission.id, problemId }),
      },
    })

    return NextResponse.json(createSuccessResponse({
      id: submission.id,
      userId: submission.userId,
      problemId: submission.problemId,
      code: submission.code,
      language: submission.language,
      status: submission.status,
      aiReview: aiReviewText,
      createdAt: submission.createdAt.toISOString(),
    }, '提交成功'))
  } catch (error) {
    console.error('Submit code error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}
