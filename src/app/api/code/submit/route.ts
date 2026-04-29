import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createSuccessResponse, createErrorResponse, getCurrentUserId } from '@/lib/utils/response'
import { chatNonStream, isCozeConfigured, parseJsonAnswer } from '@/lib/ai/coze'
import { checkAndAwardAchievements } from '@/lib/domain/achievements'
import type { SubmitCodeRequest } from '@/types/api'

/**
 * AI 返回的结构化评审结果
 */
interface AIReviewResult {
  overallScore: number
  feedback: string
  issues: { type: 'error' | 'warning' | 'info'; line: number; message: string }[]
  suggestions: string[]
  strengths: string[]
  capabilityScores?: {
    basicSyntax: number
    memoryManagement: number
    dataStructures: number
    oop: number
    stlLibrary: number
    systemProgramming: number
  }
}

/**
 * POST /api/code/submit
 *
 * 统一提交链路：
 * 1. 调用 Coze codeReview Bot 进行结构化评审
 * 2. 根据 overallScore 判定 Passed/Failed
 * 3. 更新 CapabilityRadar（能力雷达图）
 * 4. 保存提交记录 + 活动日志
 */
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

    const problem = await prisma.problem.findUnique({ where: { id: problemId } })
    if (!problem) {
      return NextResponse.json(createErrorResponse('题目不存在'), { status: 404 })
    }

    let status = 'Passed'
    let aiReviewText = ''
    let review: AIReviewResult | null = null

    if (isCozeConfigured('codeReview')) {
      const prompt = buildReviewPrompt(problem, code, language)
      try {
        const { answer } = await chatNonStream('codeReview', prompt)
        aiReviewText = answer

        try {
          review = parseJsonAnswer<AIReviewResult>(answer)
          status = (review.overallScore >= 60) ? 'Passed' : 'Failed'
        } catch {
          // AI 返回非结构化文本，仍保存但默认 Passed
        }
      } catch {
        aiReviewText = 'AI 评审服务暂时不可用'
      }
    } else {
      aiReviewText = '代码审查 Bot 未配置。请在扣子平台创建代码审查 Bot 并配置环境变量。'
    }

    // 保存提交记录
    const submission = await prisma.codeSubmission.create({
      data: { userId, problemId, code, language, status, aiReview: aiReviewText },
    })

    // 更新能力雷达图
    if (review?.capabilityScores) {
      await updateCapabilityRadar(userId, review.capabilityScores)
    }

    // 写入活动日志
    await prisma.activityLog.create({
      data: {
        userId,
        type: 'practice',
        title: `提交了练习题「${problem.title}」`,
        description: `状态：${status}${review ? `，得分：${review.overallScore}` : ''}`,
        metadata: JSON.stringify({ submissionId: submission.id, problemId }),
      },
    })

    // 检测成就
    const newAchievements = await checkAndAwardAchievements(userId, {
      type: 'submission',
      score: review?.overallScore ?? null,
      status,
    })

    return NextResponse.json(createSuccessResponse({
      id: submission.id,
      userId: submission.userId,
      problemId: submission.problemId,
      code: submission.code,
      language: submission.language,
      status: submission.status,
      aiReview: aiReviewText,
      overallScore: review?.overallScore ?? null,
      capabilityScores: review?.capabilityScores ?? null,
      newAchievements,
      createdAt: submission.createdAt.toISOString(),
    }, '提交成功'))
  } catch (error) {
    console.error('Submit code error:', error)
    return NextResponse.json(createErrorResponse('服务器错误'), { status: 500 })
  }
}

/**
 * 构造结构化评审 Prompt
 */
function buildReviewPrompt(
  problem: { title: string; description: string; testCases: string },
  code: string,
  language: string,
): string {
  return `请对以下 ${language === 'cpp' ? 'C++' : 'C'} 代码进行评审。

## 题目
**${problem.title}**
${problem.description}

## 测试用例
${problem.testCases}

## 提交的代码
\`\`\`${language}
${code}
\`\`\`

请以 JSON 格式返回评审结果，包含以下字段：
{
  "overallScore": 0-100的综合评分,
  "feedback": "总体评价（中文）",
  "issues": [{"type": "error|warning|info", "line": 行号, "message": "问题描述"}],
  "suggestions": ["改进建议1", "改进建议2"],
  "strengths": ["代码优点1", "代码优点2"],
  "capabilityScores": {
    "basicSyntax": 0-100,
    "memoryManagement": 0-100,
    "dataStructures": 0-100,
    "oop": 0-100,
    "stlLibrary": 0-100,
    "systemProgramming": 0-100
  }
}

评分维度说明：
- basicSyntax: 基础语法的正确性和规范性
- memoryManagement: 内存分配/释放/指针使用
- dataStructures: 数据结构和算法的选择与实现
- oop: 面向对象设计（仅 C++ 适用，C 语言此项给 -1）
- stlLibrary: 标准库的使用是否得当
- systemProgramming: 错误处理、资源管理等系统编程能力

只返回 JSON，不要包含其他内容。`
}

/**
 * 增量更新用户能力雷达图
 * 使用加权移动平均：新值 = 旧值 * 0.7 + 本次得分 * 0.3
 */
async function updateCapabilityRadar(
  userId: string,
  scores: NonNullable<AIReviewResult['capabilityScores']>,
) {
  const existing = await prisma.capabilityRadar.findUnique({ where: { userId } })

  const blend = (oldVal: number, newVal: number) =>
    newVal < 0 ? oldVal : Math.round(oldVal * 0.7 + newVal * 0.3)

  if (existing) {
    await prisma.capabilityRadar.update({
      where: { userId },
      data: {
        basicSyntax: blend(existing.basicSyntax, scores.basicSyntax),
        memoryManagement: blend(existing.memoryManagement, scores.memoryManagement),
        dataStructures: blend(existing.dataStructures, scores.dataStructures),
        oop: blend(existing.oop, scores.oop),
        stlLibrary: blend(existing.stlLibrary, scores.stlLibrary),
        systemProgramming: blend(existing.systemProgramming, scores.systemProgramming),
      },
    })
  } else {
    await prisma.capabilityRadar.create({
      data: {
        userId,
        basicSyntax: Math.max(0, scores.basicSyntax),
        memoryManagement: Math.max(0, scores.memoryManagement),
        dataStructures: Math.max(0, scores.dataStructures),
        oop: Math.max(0, scores.oop),
        stlLibrary: Math.max(0, scores.stlLibrary),
        systemProgramming: Math.max(0, scores.systemProgramming),
      },
    })
  }
}
